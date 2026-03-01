"use client";

import { useState, useEffect } from "react";
import { Review, SummaryFile } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsSection } from "@/components/features/reviews/reviews-section";
import { SummariesSection } from "@/components/features/summaries/summaries-section";
import { useTranslations } from "next-intl";
import { MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseContentTabsProps {
  reviews: Review[];
  summaryFiles: SummaryFile[];
  courseId: number;
}

export function CourseContentTabs({
  reviews,
  summaryFiles,
  courseId,
}: CourseContentTabsProps) {
  const t = useTranslations("Summaries");
  const [reviewCount, setReviewCount] = useState(reviews.length);
  const [summaryCount, setSummaryCount] = useState(summaryFiles.length);

  useEffect(() => {
    const onReviewAdded = () => setReviewCount((c) => c + 1);
    const onReviewDeleted = () => setReviewCount((c) => Math.max(0, c - 1));
    const onSummaryAdded = () => setSummaryCount((c) => c + 1);
    const onSummaryDeleted = () => setSummaryCount((c) => Math.max(0, c - 1));
    window.addEventListener("review-added", onReviewAdded);
    window.addEventListener("review-deleted", onReviewDeleted);
    window.addEventListener("summary-added", onSummaryAdded);
    window.addEventListener("summary-deleted", onSummaryDeleted);
    return () => {
      window.removeEventListener("review-added", onReviewAdded);
      window.removeEventListener("review-deleted", onReviewDeleted);
      window.removeEventListener("summary-added", onSummaryAdded);
      window.removeEventListener("summary-deleted", onSummaryDeleted);
    };
  }, []);

  return (
    <div className="md:col-span-2">
      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {t("tabReviews")}
            {reviewCount > 0 && (
              <Badge variant="secondary" className="rounded-full ml-1 text-xs px-1.5 py-0">
                {reviewCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="summaries" className="gap-1.5">
            <FileText className="h-4 w-4" />
            {t("tabSummaries")}
            {summaryCount > 0 && (
              <Badge variant="secondary" className="rounded-full ml-1 text-xs px-1.5 py-0">
                {summaryCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          <ReviewsSection reviews={reviews} courseId={courseId} />
        </TabsContent>
        <TabsContent value="summaries">
          <SummariesSection summaryFiles={summaryFiles} courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
