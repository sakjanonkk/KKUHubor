"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@/types";
import { Star } from "lucide-react";
import { AddTagDialog } from "./add-tag-dialog";
import { BookmarkButton } from "./bookmark-button";
import { useLocale } from "next-intl";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const locale = useLocale();
  const hasReviews = (course.reviewCount || 0) > 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 group relative bg-card/50 backdrop-blur-sm">
      {/* Bookmark Button - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        <BookmarkButton courseCode={course.code} />
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2 mb-2 pr-8">
          <Badge
            variant={hasReviews ? "default" : "secondary"}
            className="font-mono text-xs"
          >
            {course.code}
          </Badge>
          {hasReviews && (
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">
                {course.avgRating}
              </span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.nameTH}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm font-medium text-muted-foreground line-clamp-1">
          {course.nameEN}
        </p>
        <div className="mt-2">
          <Badge
            variant="outline"
            style={{
              backgroundColor: course.facultyColor || "#f3f4f6",
              color: course.facultyColor ? "#ffffff" : "#1f2937",
              borderColor: "transparent",
            }}
            className="font-normal"
          >
            {course.facultyNameEN || course.facultyNameTH}
          </Badge>
        </div>

        {/* Course Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{course.tags.length - 3} more
              </Badge>
            )}
            <AddTagDialog courseId={course.id} />
          </div>
        )}

        {(!course.tags || course.tags.length === 0) && (
          <div className="mt-3 flex">
            <AddTagDialog courseId={course.id} />
          </div>
        )}

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {hasReviews ? (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">
                  {course.reviewCount}
                </span>{" "}
                reviews
              </span>
            ) : (
              <span className="italic opacity-70">No reviews yet</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant={hasReviews ? "default" : "outline"}
          className="w-full"
          asChild
        >
          <a href={`/${locale}/courses/${course.code}`}>
            {hasReviews ? "View Reviews" : "Write First Review"}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
