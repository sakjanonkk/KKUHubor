import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      course_id,
      reviewer_name,
      rating,
      grade_received,
      semester,
      content,
    } = body;

    // Basic validation
    if (!course_id || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
