"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Pencil, Trash2, Check, X } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useUserIdentity } from "@/hooks/use-user-identity";
import { useTranslations } from "next-intl";
import { getOrCreateSessionId } from "@/lib/session";

interface Comment {
  comment_id: number;
  content: string;
  author_name: string;
  created_at: string;
  session_id: string | null;
}

interface CommentSectionProps {
  reviewId: number;
}

export function CommentSection({ reviewId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const t = useTranslations("Comments");

  const userName = useUserIdentity((state) => state.name);

  const sessionIdRef = useRef<string>("");
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?reviewId=${reviewId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          content: newComment,
          authorName: userName || "Anonymous",
          sessionId: getOrCreateSessionId(),
        }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment("");
        toast.success(t("success"));
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    const sessionId = sessionIdRef.current;
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: editingId,
          session_id: sessionId,
          content: editContent,
        }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.comment_id === editingId ? { ...c, content: editContent } : c
          )
        );
        setEditingId(null);
        setEditContent("");
        toast.success(t("editSuccess"));
      } else {
        toast.error(t("editError"));
      }
    } catch (error) {
      toast.error(t("editError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const sessionId = sessionIdRef.current;
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: deleteId,
          session_id: sessionId,
        }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.filter((c) => c.comment_id !== deleteId)
        );
        toast.success(t("deleteSuccess"));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-sm font-semibold mb-3">{t("title")}</h4>

      {/* Comment List */}
      <div className="mb-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment) => {
              const isOwner = comment.session_id === sessionIdRef.current;
              const isEditing = editingId === comment.comment_id;

              return (
                <div
                  key={comment.comment_id}
                  className="bg-muted/50 p-2 rounded-md text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <UserAvatar name={comment.author_name} size={18} />
                      <span className="font-bold text-xs">
                        {comment.author_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {isOwner && !isEditing && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingId(comment.comment_id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setDeleteId(comment.comment_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-1 items-center">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="h-7 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleEdit}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {t("noComments")}
          </p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder={t("placeholder")}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
        />
        <Button
          size="sm"
          className="h-8 px-3"
          onClick={handlePostComment}
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
