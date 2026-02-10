"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Review } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Flag, ThumbsUp, MessageCircle, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "./report-dialog";
import { EditReviewDialog } from "./edit-review-dialog";
import { CommentSection } from "./comment-section";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const t = useTranslations("Review");

  // Social State
  const [likes, setLikes] = useState(review.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    // Check local storage for like status (Anonymous user persistence)
    const likedReviews = JSON.parse(
      localStorage.getItem("liked_reviews") || "[]"
    );
    if (likedReviews.includes(review.id)) {
      setIsLiked(true);
    }

    // Check ownership via session_id
    const sessionId = localStorage.getItem("session_id");
    if (sessionId && review.sessionId && sessionId === review.sessionId) {
      setIsOwner(true);
    }
  }, [review.id, review.sessionId]);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    const sessionId = localStorage.getItem("session_id");
    try {
      const res = await fetch(
        `/api/reviews?id=${review.id}&session_id=${sessionId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const handleLike = async () => {
    // Get or create session ID
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      localStorage.setItem("session_id", sessionId);
    }

    // Optimistic UI Update
    const prevLikes = likes;
    const prevIsLiked = isLiked;

    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Sync with server source of truth if needed, but usually redundant if optimistic worked
        // setLikes(data.count);

        // Update Local Storage
        const likedReviews = JSON.parse(
          localStorage.getItem("liked_reviews") || "[]"
        );
        if (data.liked) {
          if (!likedReviews.includes(review.id)) {
            likedReviews.push(review.id);
          }
        } else {
          const index = likedReviews.indexOf(review.id);
          if (index > -1) likedReviews.splice(index, 1);
        }
        localStorage.setItem("liked_reviews", JSON.stringify(likedReviews));
      } else {
        // Revert on failure
        setLikes(prevLikes);
        setIsLiked(prevIsLiked);
        toast.error(t("likeError"));
      }
    } catch (error) {
      setLikes(prevLikes);
      setIsLiked(prevIsLiked);
    }
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-semibold">
                  {review.reviewerName || t("anonymous")}
                </div>
                <div className="flex items-center gap-2">
                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && (
                        <>
                          <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("delete")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => setReportOpen(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        {t("report")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                <span>{review.semester}</span> |
                <span>{t("grade")}: {review.gradeReceived || "-"}</span> |
                <span suppressHydrationWarning>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm mb-4">{review.content}</p>

          {/* Social Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 px-3 md:h-8 md:px-2 gap-1.5",
                isLiked && "text-blue-500 hover:text-blue-600"
              )}
              onClick={handleLike}
            >
              <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs font-semibold">{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 md:h-8 md:px-2 gap-1.5"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{t("comments")}</span>
            </Button>
          </div>

          {/* Comment Section */}
          {showComments && <CommentSection reviewId={review.id} />}
        </CardContent>
      </Card>

      <ReportDialog
        reviewId={review.id}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />

      {isOwner && (
        <EditReviewDialog
          review={review}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
}
