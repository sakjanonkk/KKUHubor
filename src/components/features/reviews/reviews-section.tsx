"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Review } from "@/types";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { ReviewSort, sortReviews } from "./review-sort";

interface ReviewsSectionProps {
  reviews: Review[];
  courseId: number;
}

export function ReviewsSection({ reviews, courseId }: ReviewsSectionProps) {
  const t = useTranslations("CourseDetail");
  const [sortedReviews, setSortedReviews] = useState<Review[]>(
    sortReviews(reviews, "recent")
  );

  const handleSort = (newSortedReviews: Review[]) => {
    setSortedReviews(newSortedReviews);
  };

  return (
    <div className="md:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {t("studentReviews")}
          {reviews.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {reviews.length}
            </Badge>
          )}
        </h3>
        {reviews.length > 1 && (
          <ReviewSort
            reviews={reviews}
            onSort={handleSort}
            defaultSort="recent"
          />
        )}
      </div>

      {sortedReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed animate-in fade-in zoom-in duration-500">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ThumbsUp className="w-10 h-10 text-muted-foreground fill-muted-foreground/20" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">{t("noReviewsTitle")}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-base leading-relaxed">
            {t("noReviewsDesc")}
          </p>
          <ReviewForm courseId={courseId} />
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review, i) => (
            <div
              key={review.id}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
