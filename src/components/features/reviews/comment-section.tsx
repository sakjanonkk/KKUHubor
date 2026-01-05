"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  comment_id: number;
  content: string;
  author_name: string;
  created_at: string;
}

interface CommentSectionProps {
  reviewId: number;
}

export function CommentSection({ reviewId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          authorName: "Anonymous", // Could be customizable later
        }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment("");
        toast.success("Comment posted!");
      } else {
        toast.error("Failed to post comment");
      }
    } catch (error) {
      toast.error("Error posting comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-3">Comments</h4>

      {/* Comment List */}
      <div className="mb-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Using simple div with overflow for now, assuming external styles handle scrollbar or default */}
            {comments.map((comment) => (
              <div
                key={comment.comment_id}
                className="bg-muted/50 p-2 rounded-md text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs">
                    {comment.author_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Write a comment..."
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
    </div>
  );
}
