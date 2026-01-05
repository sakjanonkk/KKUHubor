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
      <section className="relative py-20 md:py-32">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
            ✨ The best way to review KKU courses
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            KKUHubor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Find reviews, share experiences, and survive your semester. Join our
            community to make better course decisions.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mb-12 w-full">
            <SearchBar />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{stats.courses}+</span>
              <span className="text-sm text-muted-foreground">Courses</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{stats.reviews}+</span>
              <span className="text-sm text-muted-foreground">Reviews</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">100%</span>
              <span className="text-sm text-muted-foreground">Anonymous</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">Free</span>
              <span className="text-sm text-muted-foreground">Forever</span>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Recently Reviewed
              </h2>
              <p className="text-muted-foreground mt-2">
                See what others are saying about their classes.
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/courses">
                View all courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestReviews.map((review) => (
              <Card
                key={review.review_id}
                className="h-full flex flex-col hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-mono">
                      {review.course_code}
                    </Badge>
                    <div className="flex items-center text-yellow-500 text-sm font-bold">
                      {review.rating}{" "}
                      <Star className="fill-current ml-1" size={14} />
                    </div>
                  </div>
                  <Link
                    href={`/courses/${review.course_code}`}
                    className="hover:underline"
                  >
                    <h3 className="font-semibold line-clamp-1">
                      {review.name_en}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {review.name_th}
                    </p>
                  </Link>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-4 relative">
                    <span className="text-primary/20 absolute -top-2 -left-1 text-2xl">
                      "
                    </span>
                    {review.content}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.reviewer_name || "Anonymous"}</span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/courses">View all courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Search</h3>
              <p className="text-muted-foreground">
                Quickly find any course by code or name to see all available
                reviews.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Anonymous Reviews</h3>
              <p className="text-muted-foreground">
                Share your honest feedback without worry. Your identity is
                always protected.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Better Decisions</h3>
              <p className="text-muted-foreground">
                Plan your semester with confidence using insights from other
                students.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
