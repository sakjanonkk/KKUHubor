import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getCourses, SortOption } from "@/actions/get-courses";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseRequestDialog } from "@/components/features/courses/course-request-dialog";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { CoursePagination } from "@/components/features/courses/course-pagination";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCategory, GradingType } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";

interface CoursesPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    gradingType?: string;
    facultyId?: string;
    minRating?: string;
    hasReviews?: string;
    sortBy?: string;
    page?: string;
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
    page,
  } = await searchParams;

  const t = await getTranslations("Courses");

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

  const validPage = page ? parseInt(page, 10) : 1;

  const { courses, totalCount, totalPages, currentPage } = await getCourses(
    query,
    validCategory,
    validGradingType,
    validFacultyId,
    validMinRating,
    validHasReviews,
    validSortBy,
    validPage
  );

  // Count active filters for display
  const activeFilters = [
    query && `"${query}"`,
    validCategory && `Category: ${validCategory}`,
    validGradingType && `Grading: ${validGradingType}`,
    validFacultyId && `Faculty ID: ${validFacultyId}`,
    validMinRating && `Rating ≥ ${validMinRating}`,
    validHasReviews && t("activeFilters"), // Or logic for "Has Reviews" specific text
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      <PageHeader title={t("title")} description={t("description")}>
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
              {t("activeFilters")}
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
          {t("foundPrefix")}{" "}
          <span className="text-foreground font-bold">{totalCount}</span>{" "}
          {totalCount !== 1 ? t("coursesUnit") : t("courseUnit")}
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
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("noResultTitle")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base leading-relaxed">
                {t("noResultDescription")}
              </p>
              <Button variant="outline" size="lg" asChild className="rounded-full px-8">
                <Link href="/courses">{t("clearFilters")}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <CoursePagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </main>
  );
}
