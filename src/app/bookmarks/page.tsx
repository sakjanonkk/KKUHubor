"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/contexts/bookmark-context";
import { CourseCard } from "@/components/features/courses/course-card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Course } from "@/types";
import { PageHeader } from "@/components/layout/page-header";

export default function BookmarksPage() {
  const { bookmarks, clearBookmarks } = useBookmarks();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookmarkedCourses() {
      if (bookmarks.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/courses/by-codes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ codes: bookmarks }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching bookmarked courses:", err);
        setError("Failed to load bookmarked courses");
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedCourses();
  }, [bookmarks]);

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        title="Bookmarked Courses"
        description="Your saved courses for quick access. Bookmarks are stored locally in your browser so you can easily find them later."
      >
        {bookmarks.length > 0 && (
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/20 hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to clear all bookmarks?")
              ) {
                clearBookmarks();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-muted/50 rounded-lg animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 border-dashed">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-red-700 dark:text-red-400">
              Failed to load courses
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {error}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground fill-muted-foreground/20" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No bookmarks yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              Start building your schedule by clicking the heart icon on any
              course card.
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-muted-foreground">
                Showing {courses.length} saved course
                {courses.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <div
                  key={course.id}
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
