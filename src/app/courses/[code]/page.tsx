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
    <main className="container mx-auto p-6 space-y-8">
      {/* Course Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Badge variant="outline" className="text-lg font-mono mb-2">
              {course.code}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{course.nameTH}</h1>
            <h2 className="text-xl text-muted-foreground">{course.nameEN}</h2>
            <div className="mt-4 flex gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: course.facultyColor || "#f3f4f6",
                  color: course.facultyColor ? "#ffffff" : "#1f2937",
                  borderColor: "transparent",
                }}
              >
                {course.facultyNameEN || course.facultyNameTH}
              </Badge>
              {/* Render tags if available. Note: raw SQL getCourse might not select tags yet unless updated. */}
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="mb-4">
              <ReviewForm courseId={course.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Stats & Distribution */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
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
          <h3 className="text-2xl font-bold mb-6">Student Reviews</h3>

          {reviews.length === 0 ? (
            <p className="text-muted-foreground italic">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function decodedCode(code: string) {
  return decodeURIComponent(code);
}
