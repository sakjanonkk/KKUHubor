"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Review, ReviewCourseInfo } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MoreHorizontal, Flag, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
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
import { ReviewReactions } from "./review-reactions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getOrCreateSessionId } from "@/lib/session";

interface ReviewCardProps {
  review: Review;
  course?: ReviewCourseInfo;
}

export function ReviewCard({ review, course }: ReviewCardProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Review");

  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (sessionId && review.sessionId && sessionId === review.sessionId) {
      setIsOwner(true);
    }
  }, [review.id, review.sessionId]);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    const sessionId = getOrCreateSessionId();
    try {
      const res = await fetch(`/api/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, session_id: sessionId }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("review-deleted", { detail: review.id }));
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2">
          {course && (
            <Link
              href={`/courses/${course.code}`}
              className="flex items-center gap-2 mb-2 group/course"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                {course.code}
              </Badge>
              <span className="text-sm font-medium truncate group-hover/course:text-primary transition-colors">
                {locale === "en" && course.nameEN ? course.nameEN : course.nameTH}
              </span>
            </Link>
          )}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserAvatar name={review.reviewerName || t("anonymous")} size={28} style={review.avatarStyle} seed={review.avatarSeed} />
                  <span className="font-semibold">
                    {review.reviewerName || t("anonymous")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-1 pt-2">
            <ReviewReactions
              reviewId={review.id}
              initialTotalReactions={review.totalReactions}
              initialReactionCounts={review.reactionCounts}
            />

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
