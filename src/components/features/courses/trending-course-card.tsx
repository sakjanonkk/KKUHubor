"use client";

import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { useLocale } from "next-intl";

interface TrendingCourse {
  code: string;
  nameTH: string;
  nameEN: string | null;
  reviewCount: number;
  avgRating: number;
  facultyColor: string | null;
  facultyName: string | null;
}

interface TrendingCourseCardProps {
  course: TrendingCourse;
}

export function TrendingCourseCard({ course }: TrendingCourseCardProps) {
  const locale = useLocale();

  return (
    <a
      href={`/${locale}/courses/${course.code}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
    >
      {/* Faculty Color Dot */}
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: course.facultyColor || "#808080" }}
      />

      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="font-mono text-xs shrink-0">
            {course.code}
          </Badge>
        </div>
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {course.nameTH}
        </p>
        {course.nameEN && (
          <p className="text-xs text-muted-foreground truncate">
            {course.nameEN}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
          <span className="text-sm font-bold">{course.avgRating}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="w-3 h-3" />
          <span>{course.reviewCount}</span>
        </div>
      </div>
    </a>
  );
}
