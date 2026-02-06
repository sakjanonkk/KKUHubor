import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schema
const reviewSchema = z.object({
  course_id: z.number().positive("Course ID must be a positive number"),
  reviewer_name: z.string().max(100, "Name too long").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  grade_received: z.string().max(5).optional(),
  semester: z.string().max(20).optional(),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content too long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues.map(e => e.message) },
        { status: 400 }
      );
    }

    const { course_id, reviewer_name, rating, grade_received, semester, content } = validated.data;

    // Insert into DB
    // Assuming table 'reviews' exists.
    // We map snake_case columns.
    const query = `
      INSERT INTO reviews (course_id, reviewer_name, rating, grade_received, semester, content, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const values = [
      course_id,
      reviewer_name || "Anonymous", // Default to Anonymous
      rating,
      grade_received,
      semester,
      content,
    ];

    const result = await db.query(query, values);

    // Convert keys to match TypeScript interface (camelCase)
    const newReview = result.rows[0];
    const formattedReview = {
      id: newReview.review_id,
      courseId: newReview.course_id,
      reviewerName: newReview.reviewer_name,
      rating: newReview.rating,
      gradeReceived: newReview.grade_received,
      semester: newReview.semester,
      content: newReview.content,
      createdAt: newReview.created_at,
    };

    return NextResponse.json(formattedReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
