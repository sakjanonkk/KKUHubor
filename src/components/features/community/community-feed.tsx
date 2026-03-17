"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewWithCourse } from "@/types";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SortType = "latest" | "popular";

export function CommunityFeed() {
  const t = useTranslations("Community");
  const [reviews, setReviews] = useState<ReviewWithCourse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sort, setSort] = useState<SortType>("latest");

  const fetchReviews = useCallback(
    async (pageNum: number, reset = false) => {
      if (reset) setInitialLoading(true);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reviews/feed?page=${pageNum}&limit=10&sort=${sort}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setReviews((prev) =>
          reset ? data.reviews : [...prev, ...data.reviews]
        );
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [sort]
  );

  useEffect(() => {
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Listen for review events (add/delete/update) to refresh
  useEffect(() => {
    const handleRefresh = () => fetchReviews(1, true);
    window.addEventListener("review-added", handleRefresh);
    window.addEventListener("review-deleted", handleRefresh);
    window.addEventListener("review-updated", handleRefresh);
    return () => {
      window.removeEventListener("review-added", handleRefresh);
      window.removeEventListener("review-deleted", handleRefresh);
      window.removeEventListener("review-updated", handleRefresh);
    };
  }, [fetchReviews]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(page + 1);
    }
  };

  const handleSortChange = (newSort: SortType) => {
    if (newSort !== sort) {
      setSort(newSort);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sort Controls */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={sort === "latest" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleSortChange("latest")}
        >
          <Clock className="w-4 h-4 mr-1.5" />
          {t("sortLatest")}
        </Button>
        <Button
          variant={sort === "popular" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleSortChange("popular")}
        >
          <TrendingUp className="w-4 h-4 mr-1.5" />
          {t("sortPopular")}
        </Button>
      </div>

      {/* Feed */}
      {initialLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">{t("noReviews")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards",
              )}
              style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
            >
              <ReviewCard review={review} course={review.course} />
            </div>
          ))}

          {/* Load More / End of Feed */}
          <div className="flex justify-center py-8">
            {hasMore ? (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("loading")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("endOfFeed")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
