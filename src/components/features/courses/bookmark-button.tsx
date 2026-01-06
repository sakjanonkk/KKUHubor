"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/bookmark-context";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  courseCode: string;
  variant?: "icon" | "button";
  className?: string;
}

export function BookmarkButton({
  courseCode,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(courseCode);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(courseCode);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          "hover:bg-red-50 dark:hover:bg-red-950/30",
          "focus:outline-none focus:ring-2 focus:ring-red-500/50",
          className
        )}
        aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-200",
            bookmarked
              ? "fill-red-500 text-red-500 scale-110"
              : "text-gray-400 hover:text-red-400"
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      className={cn(
        "gap-2",
        bookmarked && "bg-red-500 hover:bg-red-600 text-white",
        className
      )}
    >
      <Heart className={cn("w-4 h-4", bookmarked && "fill-current")} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
