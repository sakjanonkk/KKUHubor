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

export type SortOption = "recent" | "helpful" | "highest" | "lowest";

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
    case "helpful":
      return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    case "highest":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return sorted.sort((a, b) => a.rating - b.rating);
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
          <SelectItem value="helpful">{t("sortMostHelpful")}</SelectItem>
          <SelectItem value="highest">{t("sortHighestRated")}</SelectItem>
          <SelectItem value="lowest">{t("sortLowestRated")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
