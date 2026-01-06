import Link from "next/link";
import { getCourses, SortOption } from "@/actions/get-courses";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseRequestDialog } from "@/components/features/courses/course-request-dialog";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCategory, GradingType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface CoursesPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    gradingType?: string;
    facultyId?: string;
    minRating?: string;
    hasReviews?: string;
    sortBy?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const {
    query,
    category,
    gradingType,
    facultyId,
    minRating,
    hasReviews,
    sortBy,
  } = await searchParams;

  // Validate Enums
  const validCategory = Object.values(CourseCategory).includes(
    category as CourseCategory
  )
    ? (category as CourseCategory)
    : undefined;

  const validGradingType = Object.values(GradingType).includes(
    gradingType as GradingType
  )
    ? (gradingType as GradingType)
    : undefined;

  // Parse numeric and boolean values
  const validFacultyId = facultyId ? parseInt(facultyId, 10) : undefined;
  const validMinRating = minRating ? parseInt(minRating, 10) : undefined;
  const validHasReviews = hasReviews === "true";
  const validSortBy = sortBy as SortOption | undefined;

  const courses = await getCourses(
    query,
    validCategory,
    validGradingType,
    validFacultyId,
    validMinRating,
    validHasReviews,
    validSortBy
  );

  // Count active filters for display
  const activeFilters = [
    query && `"${query}"`,
    validCategory && `Category: ${validCategory}`,
    validGradingType && `Grading: ${validGradingType}`,
    validFacultyId && `Faculty ID: ${validFacultyId}`,
    validMinRating && `Rating ≥ ${validMinRating}`,
    validHasReviews && "Has Reviews",
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        title="Available Courses"
        description="Browse and review courses offered this semester. Find the perfect elective or check reviews for your major requirements."
      >
        <div className="flex gap-3">
          <CourseRequestDialog />
          <CourseFilter />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm text-muted-foreground font-medium">
              Active filters:
            </span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2.5 py-1"
              >
                {filter}
              </Badge>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-6 font-medium">
          Found{" "}
          <span className="text-foreground font-bold">{courses.length}</span>{" "}
          course{courses.length !== 1 ? "s" : ""}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course, i) => (
              <div
                key={course.id}
                className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No courses found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                We couldn't find any courses matching your criteria. Try
                adjusting your filters or search terms.
              </p>
              <Button variant="outline" asChild>
                <Link href="/courses">Clear all filters</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
