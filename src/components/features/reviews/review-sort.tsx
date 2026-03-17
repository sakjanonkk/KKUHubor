"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Review } from "@/types";

export type SortOption = "recent" | "popular";

interface ReviewSortProps {
  reviews: Review[];
  onSort: (sortedReviews: Review[]) => void;
  defaultSort?: SortOption;
}

export function sortReviews(reviews: Review[], sortBy: SortOption): Review[] {
  const sorted = [...reviews];
  switch (sortBy) {
    case "recent":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "popular":
      return sorted.sort((a, b) => {
        const scoreA = a.totalReactions || 0;
        const scoreB = b.totalReactions || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.likeCount || 0) - (a.likeCount || 0);
      });
    default:
      return sorted;
  }
}

export function ReviewSort({ reviews, onSort, defaultSort = "recent" }: ReviewSortProps) {
  const t = useTranslations("CourseDetail");

  const handleSortChange = (value: SortOption) => {
    onSort(sortReviews(reviews, value));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t("sortBy")}:</span>
      <Select defaultValue={defaultSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t("sortMostRecent")}</SelectItem>
          <SelectItem value="popular">{t("sortMostPopular")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
