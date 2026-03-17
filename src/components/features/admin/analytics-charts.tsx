"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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
  totalReactions: number;
  topCourses: TopCourse[];
  totalReviews: number;
  translations: {
    reviewsPerDay: string;
    totalReactions: string;
    topCourses: string;
    reviews: string;
    noData: string;
  };
}

export function AnalyticsCharts({
  reviewsPerDay,
  totalReactions,
  topCourses,
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

      {/* Total Reactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-base leading-none">{"\u{1F44D}"}</span>
            {t.totalReactions}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl mb-2">{"\u{1F44D}"}</span>
          <span className="text-4xl font-bold">{totalReactions}</span>
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
