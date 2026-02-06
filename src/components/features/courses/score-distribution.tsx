import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface ScoreDistributionProps {
  distribution: RatingDistribution[];
  totalReviews: number;
  averageRating: number;
  translations?: {
    reviews: string;
    star: string;
  };
}

export function ScoreDistribution({
  distribution,
  totalReviews,
  averageRating,
  translations,
}: ScoreDistributionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg w-full sm:w-auto">
          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex text-yellow-500 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(averageRating)
                    ? "fill-current"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {totalReviews} {translations?.reviews ?? "reviews"}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          {distribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-2 text-sm">
              <div className="w-12 text-right whitespace-nowrap text-muted-foreground">
                {item.rating} {translations?.star ?? "star"}
              </div>
              <Progress value={item.percentage} className="h-2.5 flex-1" />
              <div className="w-12 text-right text-muted-foreground text-xs">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
