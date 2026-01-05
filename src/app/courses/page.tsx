import db from "@/lib/db";
import { Course } from "@/types";
import { CourseCard } from "@/components/features/courses/course-card";
import { CourseRequestDialog } from "@/components/features/courses/course-request-dialog";
import { Suspense } from "react";

async function getCourses(queryStr?: string): Promise<Course[]> {
  try {
    let queryText = `
      SELECT 
        c.course_id as id, 
        c.course_code as code, 
        c.name_th as "nameTH", 
        c.name_en as "nameEN", 
        f.faculty_id as "facultyId",
        f.name_th as "facultyNameTH",
        f.name_en as "facultyNameEN",
        f.color_code as "facultyColor",
        COALESCE(ROUND(AVG(r.rating), 1), 0)::float as "avgRating",
        COUNT(r.review_id)::int as "reviewCount"
      FROM courses c
      LEFT JOIN reviews r ON c.course_id = r.course_id
      LEFT JOIN faculties f ON c.faculty_id = f.faculty_id
    `;

    const params: any[] = [];

    if (queryStr) {
      queryText += `
        WHERE 
          c.name_th ILIKE $1 OR 
          c.name_en ILIKE $1 OR 
          c.course_code ILIKE $1
      `;
      params.push(`%${queryStr}%`);
    }

    queryText += ` 
      GROUP BY c.course_id, f.faculty_id
      ORDER BY "reviewCount" DESC, c.course_code ASC
    `;

    const result = await db.query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

interface CoursesPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { query } = await searchParams;
  const courses = await getCourses(query);

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
        <CourseRequestDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>No courses found or database connection failed.</p>
            <p className="text-sm mt-2">
              (Ensure the 'courses' table exists in your PostgreSQL database)
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
