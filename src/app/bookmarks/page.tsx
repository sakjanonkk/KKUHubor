"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/contexts/bookmark-context";
import { CourseCard } from "@/components/features/courses/course-card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Course } from "@/types";

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
    <main className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/30">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bookmarked Courses
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your saved courses for quick access. Bookmarks are stored locally in
            your browser.
          </p>
        </div>
        {bookmarks.length > 0 && (
          <Button
            variant="outline"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            No bookmarks yet
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start bookmarking courses by clicking the heart icon on any course
            card. Your bookmarks will be saved in your browser.
          </p>
          <Button asChild className="mt-4">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} bookmarked
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
