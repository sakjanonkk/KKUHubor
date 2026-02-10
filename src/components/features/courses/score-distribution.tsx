import { ThumbsUp, MessageSquare } from "lucide-react";

interface CourseLikesOverviewProps {
  totalLikes: number;
  totalReviews: number;
  translations?: {
    reviews: string;
    likes: string;
  };
}

export function CourseLikesOverview({
  totalLikes,
  totalReviews,
  translations,
}: CourseLikesOverviewProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <ThumbsUp className="w-8 h-8 fill-blue-500 text-blue-500" />
        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {totalLikes}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        {translations?.likes ?? "likes"}
      </span>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <MessageSquare className="w-3.5 h-3.5" />
        <span>
          {totalReviews} {translations?.reviews ?? "reviews"}
        </span>
      </div>
    </div>
  );
}
