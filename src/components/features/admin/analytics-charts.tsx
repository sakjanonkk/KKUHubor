"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp } from "lucide-react";

interface DailyReview {
  day: string;
  count: number;
}

interface TopCourse {
  name_th: string;
  course_code: string;
  review_count: number;
}

interface AnalyticsChartsProps {
  reviewsPerDay: DailyReview[];
  ratingDistribution: number[];
  topCourses: TopCourse[];
  totalReviews: number;
  translations: {
    reviewsPerDay: string;
    ratingOverview: string;
    topCourses: string;
    reviews: string;
    noData: string;
  };
}

export function AnalyticsCharts({
  reviewsPerDay,
  ratingDistribution,
  topCourses,
  totalReviews,
  translations: t,
}: AnalyticsChartsProps) {
  const maxDaily = Math.max(...reviewsPerDay.map((d) => d.count), 1);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {/* Reviews per day (7 days) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t.reviewsPerDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsPerDay.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.noData}
            </p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {reviewsPerDay.map((day) => (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {day.count}
                  </span>
                  <div
                    className="w-full bg-primary/80 rounded-t-sm min-h-1 transition-all"
                    style={{
                      height: `${(day.count / maxDaily) * 100}%`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(day.day).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall rating distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t.ratingOverview}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right text-muted-foreground">
                  {star}
                </span>
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <Progress value={pct} className="h-2 flex-1" />
                <span className="w-8 text-right text-xs text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Top 5 courses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t.topCourses}</CardTitle>
        </CardHeader>
        <CardContent>
          {topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.noData}
            </p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((course, i) => (
                <div key={course.course_code} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course.name_th}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.course_code}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {course.review_count} {t.reviews}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
