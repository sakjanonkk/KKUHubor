import db from "@/lib/db";
import { Course, Review } from "@/types";
import { ReviewForm } from "@/components/features/reviews/review-form";
import { ReviewsSection } from "@/components/features/reviews/reviews-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCourseDistribution } from "@/actions/get-course-distribution";
import { ScoreDistribution } from "@/components/features/courses/score-distribution";
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

  if (!course) {
    notFound();
  }

  // Fetch data in parallel
  const [reviews, distributionData] = await Promise.all([
    getReviews(course.id),
    getCourseDistribution(course.id),
  ]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title={`${course.code} ${course.nameTH}`}
        description={`${course.nameEN} • ${
          course.facultyNameEN || course.facultyNameTH
        }`}
      >
        <div className="mt-4 md:mt-0">
          <ReviewForm courseId={course.id} />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Stats & Distribution */}
          <div className="md:col-span-1 space-y-6">
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
