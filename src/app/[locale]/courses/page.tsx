import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getCourses, SortOption } from "@/actions/get-courses";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseRequestDialog } from "@/components/features/courses/course-request-dialog";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { CoursePagination } from "@/components/features/courses/course-pagination";
import { PageHeader } from "@/components/layout/page-header";
import { CourseSearch } from "@/components/features/courses/course-search";
import { ActiveFilters } from "@/components/features/courses/active-filters";
import { CourseCategory, GradingType } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface CoursesPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    gradingType?: string;
    facultyId?: string;
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
    hasReviews,
    sortBy,
    page,
  } = await searchParams;

  const t = await getTranslations("Courses");
  const tFilter = await getTranslations("Filter");

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
  const validHasReviews = hasReviews === "true";
  const validSortBy = sortBy as SortOption | undefined;

  const validPage = page ? parseInt(page, 10) : 1;

  const { courses, totalCount, totalPages, currentPage } = await getCourses(
    query,
    validCategory,
    validGradingType,
    validFacultyId,
    validHasReviews,
    validSortBy,
    validPage
  );

  // Map enum values to translated labels
  const categoryLabels: Record<string, string> = {
    GENERAL: tFilter("generalEd"),
    MAJOR: tFilter("major"),
    ELECTIVE: tFilter("elective"),
    FREE_ELECTIVE: tFilter("freeElective"),
  };
  const gradingLabels: Record<string, string> = {
    NORM: tFilter("normRef"),
    CRITERION: tFilter("criterionRef"),
  };

  // Build active filter items with keys for removal
  const activeFilterItems: { key: string; label: string }[] = [];
  if (query) activeFilterItems.push({ key: "query", label: `"${query}"` });
  if (validCategory) activeFilterItems.push({ key: "category", label: categoryLabels[validCategory] });
  if (validGradingType) activeFilterItems.push({ key: "gradingType", label: gradingLabels[validGradingType] });
  if (validHasReviews) activeFilterItems.push({ key: "hasReviews", label: tFilter("hasReviewsOnly") });
  if (validFacultyId) activeFilterItems.push({ key: "facultyId", label: tFilter("faculty") });

  return (
    <main className="min-h-screen bg-background">
      <PageHeader title={t("title")} description={t("description")}>
        <div className="flex gap-3">
          <CourseRequestDialog />
          <CourseFilter />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Results Count + Active Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-medium">
              {t("foundPrefix")}{" "}
              <span className="text-foreground font-bold">{totalCount}</span>{" "}
              {totalCount !== 1 ? t("coursesUnit") : t("courseUnit")}
            </div>
            <CourseSearch />
          </div>
          <ActiveFilters filters={activeFilterItems} />
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
              <Image src="/mascot-no-results.png" alt="No results" width={160} height={90} className="mb-6" />
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
