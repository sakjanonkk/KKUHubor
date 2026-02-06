import db from "@/lib/db";
import { Course, Review } from "@/types";
import { ReviewForm } from "@/components/features/reviews/review-form";
import { ReviewsSection } from "@/components/features/reviews/reviews-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCourseDistribution } from "@/actions/get-course-distribution";
import { ScoreDistribution } from "@/components/features/courses/score-distribution";
import { CourseStats } from "@/components/features/courses/course-stats";
import { ShareButton } from "@/components/features/courses/share-button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";

// Define Page Props manually for Next.js 15+ compatibility
interface PageProps {
  params: Promise<{ code: string }>;
}

async function getCourse(code: string): Promise<Course | null> {
  const query = `
    SELECT 
      c.course_id as id, 
      c.course_code as code, 
      c.name_th as "nameTH", 
      c.name_en as "nameEN", 
      f.faculty_id as "facultyId",
      f.name_th as "facultyNameTH",
      f.name_en as "facultyNameEN",
      f.color_code as "facultyColor"
    FROM courses c
    LEFT JOIN faculties f ON c.faculty_id = f.faculty_id
    WHERE c.course_code = $1
  `;
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

async function getReviews(courseId: number): Promise<Review[]> {
  // Using explicit column selection to match interface
  const query = `
    SELECT
      review_id as id,
      course_id as "courseId",
      reviewer_name as "reviewerName",
      rating,
      grade_received as "gradeReceived",
      semester,
      content,
      created_at as "createdAt",
      session_id as "sessionId",
      (SELECT COUNT(*)::int FROM review_likes WHERE review_id = reviews.review_id) as "likeCount"
    FROM reviews
    WHERE course_id = $1
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [courseId]);
  return result.rows;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { code } = await params;
  const course = await getCourse(decodedCode(code));
  const t = await getTranslations("CourseDetail");
  const tNav = await getTranslations("Navbar");

  if (!course) {
    notFound();
  }

  // Fetch data in parallel
  const [reviews, distributionData] = await Promise.all([
    getReviews(course.id),
    getCourseDistribution(course.id),
  ]);

  // Compute grade and semester stats from reviews
  const gradeCounts: Record<string, number> = {};
  const semesterCounts: Record<string, number> = {};
  for (const r of reviews) {
    if (r.gradeReceived) {
      gradeCounts[r.gradeReceived] = (gradeCounts[r.gradeReceived] || 0) + 1;
    }
    if (r.semester) {
      semesterCounts[r.semester] = (semesterCounts[r.semester] || 0) + 1;
    }
  }
  const avgGrade =
    Object.keys(gradeCounts).length > 0
      ? Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;
  const commonSemester =
    Object.keys(semesterCounts).length > 0
      ? Object.entries(semesterCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title={`${course.code} ${course.nameTH}`}
        description={`${course.nameEN} • ${
          course.facultyNameEN || course.facultyNameTH
        }`}
      >
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <ShareButton />
          <ReviewForm courseId={course.id} />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: tNav("courses"), href: "/courses" },
            { label: course.code },
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Stats & Distribution */}
          <div className="md:col-span-1 space-y-6">
            <CourseStats
              totalReviews={reviews.length}
              avgGrade={avgGrade}
              commonSemester={commonSemester}
              t={t}
            />
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("ratingDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreDistribution
                  distribution={distributionData.distribution}
                  totalReviews={distributionData.totalReviews}
                  averageRating={distributionData.averageRating}
                  translations={{
                    reviews: t("reviewsCount"),
                    star: t("star"),
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Reviews with Sorting */}
          <ReviewsSection reviews={reviews} courseId={course.id} />
        </div>
      </div>
    </main>
  );
}

function decodedCode(code: string) {
  return decodeURIComponent(code);
}
