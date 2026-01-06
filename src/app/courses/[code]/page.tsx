import db from "@/lib/db";
import { Course, Review } from "@/types";
import { ReviewForm } from "@/components/features/reviews/review-form";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { notFound } from "next/navigation";

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
                <CardTitle className="text-lg">Rating Distribution</CardTitle>
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

          {/* Right Column: Reviews */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Student Reviews
              {reviews.length > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {reviews.length}
                </Badge>
              )}
            </h3>

            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-muted-foreground fill-muted-foreground/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Be the first to share your experience with this course. Help
                  others make better decisions!
                </p>
                <ReviewForm courseId={course.id} />
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, i) => (
                  <div
                    key={review.id}
                    className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function decodedCode(code: string) {
  return decodeURIComponent(code);
}
