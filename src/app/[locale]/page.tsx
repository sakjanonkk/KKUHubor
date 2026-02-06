import { Link } from "@/i18n/routing";
import db from "@/lib/db";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/features/search-bar";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { TrendingCourseCard } from "@/components/features/courses/trending-course-card";
import { Star, Search, BookOpen, MessageSquare, TrendingUp } from "lucide-react";

async function getStats() {
  const coursesRes = await db.query(
    "SELECT COUNT(*)::int as count FROM courses"
  );
  const reviewsRes = await db.query(
    "SELECT COUNT(*)::int as count FROM reviews"
  );
  return {
    courses: coursesRes.rows[0].count,
    reviews: reviewsRes.rows[0].count,
  };
}

async function getTrendingCourses() {
  const res = await db.query(`
    SELECT
      c.course_code, c.name_th, c.name_en,
      COUNT(r.review_id)::int as review_count,
      ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
      f.color_code, f.name_en as faculty_name
    FROM courses c
    JOIN reviews r ON c.course_id = r.course_id
    LEFT JOIN faculties f ON c.faculty_id = f.faculty_id
    GROUP BY c.course_id, f.faculty_id
    HAVING COUNT(r.review_id) >= 1
    ORDER BY COUNT(r.review_id) DESC, AVG(r.rating) DESC
    LIMIT 6
  `);

  return res.rows.map((row: any) => ({
    code: row.course_code,
    nameTH: row.name_th,
    nameEN: row.name_en,
    reviewCount: row.review_count,
    avgRating: Number(row.avg_rating),
    facultyColor: row.color_code,
    facultyName: row.faculty_name,
  }));
}

async function getLatestReviews() {
  const res = await db.query(`
    SELECT 
      r.review_id, 
      r.rating, 
      r.content, 
      r.created_at,
      r.reviewer_name,
      r.grade_received,
      r.semester,
      c.course_code, 
      c.name_en, 
      c.name_th
    FROM reviews r
    JOIN courses c ON r.course_id = c.course_id
    ORDER BY r.created_at DESC
    LIMIT 3
  `);

  return res.rows.map((row: any) => ({
    id: row.review_id,
    courseId: row.course_id,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at,
    reviewerName: row.reviewer_name || "Anonymous",
    gradeReceived: row.grade_received,
    semester: row.semester,
    likeCount: 0, // Default as not fetched in summary
    course: {
      code: row.course_code,
      nameEN: row.name_en,
      nameTH: row.name_th,
    },
  }));
}

export default async function Home() {
  const stats = await getStats();
  const latestReviews = await getLatestReviews();
  const trendingCourses = await getTrendingCourses();
  const t = await getTranslations("Hero");

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 dark:opacity-20 animate-in fade-in zoom-in duration-1000" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full opacity-30 dark:opacity-10" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 ease-out fill-mode-backwards">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              {t("badge")}
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">
              {t("connectReview")} <br className="hidden md:block" />
              <span className="text-primary">{t("surviveSemester")}</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              {t("heroDescription")}
            </p>

            <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto mb-16 w-full">
              <div className="w-full max-w-xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative">
                  <SearchBar />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />{" "}
                  {t("trustedBy")}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{t("anonymous")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                {
                  label: t("statCourses"),
                  value: `${stats.courses}+`,
                  icon: BookOpen,
                },
                {
                  label: t("statReviews"),
                  value: `${stats.reviews}+`,
                  icon: MessageSquare,
                },
                { label: t("statUsers"), value: "2.5k+", icon: Search },
                { label: t("statFree"), value: t("statForever"), icon: Star },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">{t("latestReviews")}</h2>
              <p className="text-muted-foreground max-w-lg">
                {t("latestReviewsDesc")}
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              asChild
            >
              <Link href="/courses">
                {t("browseButton")} <BookOpen className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestReviews.map((review, i) => (
              <div
                key={review.id}
                className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-full">
                  <ReviewCard review={review} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      {trendingCourses.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-3xl font-bold">{t("trendingTitle")}</h2>
              </div>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("trendingDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {trendingCourses.map((course, i) => (
                <div
                  key={course.code}
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <TrendingCourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("featuresDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature1Title")}</h3>
              <p className="text-muted-foreground">{t("feature1Desc")}</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature2Title")}</h3>
              <p className="text-muted-foreground">{t("feature2Desc")}</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("feature3Title")}</h3>
              <p className="text-muted-foreground">{t("feature3Desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
