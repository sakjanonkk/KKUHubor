"use client";

import { ReviewWithCourse } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThumbsUp, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

interface HomeReviewCardProps {
  review: ReviewWithCourse;
}

export function HomeReviewCard({ review }: HomeReviewCardProps) {
  const locale = useLocale();
  const t = useTranslations("Review");

  const courseName =
    locale === "en" && review.course.nameEN
      ? review.course.nameEN
      : review.course.nameTH;

  return (
    <Link href={`/courses/${review.course.code}`} className="block h-full group">
      <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <CardHeader className="pb-3">
          {/* Course Info */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-mono text-xs shrink-0">
              {review.course.code}
            </Badge>
            <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {courseName}
            </span>
          </div>

          {/* Reviewer Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar name={review.reviewerName || t("anonymous")} size={24} style={review.avatarStyle} />
              <span className="font-semibold text-sm">
                {review.reviewerName || t("anonymous")}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{review.semester}</span> |
            <span>
              {t("grade")}: {review.gradeReceived || "-"}
            </span>{" "}
            |
            <span suppressHydrationWarning>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm whitespace-pre-wrap line-clamp-3 text-muted-foreground">
            {review.content}
          </p>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{review.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="text-xs">{t("comments")}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
