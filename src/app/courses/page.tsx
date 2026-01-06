import { getCourses, SortOption } from "@/actions/get-courses";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseRequestDialog } from "@/components/features/courses/course-request-dialog";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { CourseCategory, GradingType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

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
    <main className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Available Courses
          </h1>
          <p className="text-muted-foreground">
            Browse and review courses offered this semester.
          </p>
        </div>
        <div className="flex gap-2">
          <CourseFilter />
          <CourseRequestDialog />
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {courses.length} course{courses.length !== 1 ? "s" : ""}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>No courses found matching your criteria.</p>
            <p className="text-sm mt-2">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
