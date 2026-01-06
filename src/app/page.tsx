import Link from "next/link";
import db from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/features/search-bar";
import {
  Star,
  Search,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";

async function getStats() {
  const coursesCount = await db.query("SELECT COUNT(*) FROM courses");
  const reviewsCount = await db.query("SELECT COUNT(*) FROM reviews");
  return {
    courses: Number(coursesCount.rows[0].count),
    reviews: Number(reviewsCount.rows[0].count),
  };
}

async function getLatestReviews() {
  const query = `
    SELECT 
      r.review_id, 
      r.reviewer_name, 
      r.rating, 
      r.content, 
      r.created_at, 
      c.course_code, 
      c.name_en, 
      c.name_th 
    FROM reviews r 
    JOIN courses c ON r.course_id = c.course_id 
    ORDER BY r.created_at DESC 
    LIMIT 6
  `;
  const result = await db.query(query);
  return result.rows;
}

export default async function Home() {
  const stats = await getStats();
  const latestReviews = await getLatestReviews();

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
              The best way to review KKU courses
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">
              Connect. Review. <br className="hidden md:block" />
              <span className="text-primary">Survive Semester.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Find honest reviews, share your experiences, and make better
              decisions for your academic journey at KKU.
            </p>

            <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto mb-16 w-full">
              <div className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative">
                  <SearchBar />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />{" "}
                  Trusted by 5,000+ students
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>100% Anonymous</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                {
                  label: "Courses",
                  value: `${stats.courses}+`,
                  icon: BookOpen,
                },
                {
                  label: "Reviews",
                  value: `${stats.reviews}+`,
                  icon: MessageSquare,
                },
                { label: "Users", value: "2.5k+", icon: Search },
                { label: "Free", value: "Forever", icon: Star },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all hover:scale-105 duration-300"
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
      <section className="py-24 bg-muted/40 relative border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Fresh from the Community
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                See what students are saying about their classes right now.
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full group hidden md:inline-flex"
              asChild
            >
              <Link href="/courses">
                View all courses{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestReviews.map((review, i) => (
              <Card
                key={review.review_id}
                className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs px-2 py-0.5 pointer-events-none bg-primary/10 text-primary hover:bg-primary/10"
                    >
                      {review.course_code}
                    </Badge>
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded-full text-xs font-bold">
                      {review.rating}
                      <Star className="fill-current w-3 h-3" />
                    </div>
                  </div>
                  <Link
                    href={`/courses/${review.course_code}`}
                    className="group-card block"
                  >
                    <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {review.name_en}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                      {review.name_th}
                    </p>
                  </Link>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="relative flex-1">
                    <span className="text-primary/10 absolute -top-2 -left-1 text-4xl font-serif leading-none select-none">
                      "
                    </span>
                    <p className="text-sm text-muted-foreground/90 line-clamp-4 leading-relaxed pt-2 pl-2">
                      {review.content}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {review.reviewer_name?.[0] || "A"}
                      </span>
                      {review.reviewer_name || "Anonymous Student"}
                    </span>
                    <span className="opacity-70">
                      {new Date(review.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-full"
              asChild
            >
              <Link href="/courses">View all courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Why use KKUHubor?
            </h2>
            <p className="text-muted-foreground text-lg">
              We built this platform to solve the biggest pain points of course
              registration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Search",
                description:
                  "Quickly find any course by code or name to see all available reviews.",
                icon: Search,
                gradient: "from-blue-500/10 to-indigo-500/10",
                textGradient: "from-blue-600 to-indigo-600",
              },
              {
                title: "Anonymous Reviews",
                description:
                  "Share your honest feedback without worry. Your identity is always protected.",
                icon: MessageSquare,
                gradient: "from-primary/10 to-pink-500/10",
                textGradient: "from-primary to-pink-600",
              },
              {
                title: "Better Decisions",
                description:
                  "Plan your semester with confidence using insights from other students.",
                icon: BookOpen,
                gradient: "from-emerald-500/10 to-teal-500/10",
                textGradient: "from-emerald-600 to-teal-600",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
              >
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500`}
                >
                  <feature.icon
                    size={32}
                    className={`stroke-[1.5] text-transparent bg-clip-text bg-gradient-to-br ${feature.textGradient} dark:text-primary`}
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
