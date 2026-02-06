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
  session_id: z.string().max(255).optional(),
});

const updateSchema = z.object({
  review_id: z.number().positive(),
  session_id: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  grade_received: z.string().max(5).optional(),
  semester: z.string().max(20).optional(),
  content: z.string().min(10).max(2000).optional(),
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

    const { course_id, reviewer_name, rating, grade_received, semester, content, session_id } = validated.data;

    const query = `
      INSERT INTO reviews (course_id, reviewer_name, rating, grade_received, semester, content, session_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [
      course_id,
      reviewer_name || "Anonymous",
      rating,
      grade_received,
      semester,
      content,
      session_id || null,
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const validated = updateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { review_id, session_id, rating, grade_received, semester, content } = validated.data;

    // Verify ownership via session_id
    const existing = await db.query(
      "SELECT session_id FROM reviews WHERE review_id = $1",
      [review_id]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    if (!existing.rows[0].session_id || existing.rows[0].session_id !== session_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query(
      `UPDATE reviews SET
        rating = COALESCE($1, rating),
        grade_received = COALESCE($2, grade_received),
        semester = COALESCE($3, semester),
        content = COALESCE($4, content)
      WHERE review_id = $5 RETURNING *`,
      [rating, grade_received, semester, content, review_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");
    const sessionId = searchParams.get("session_id");

    if (!reviewId || !sessionId) {
      return NextResponse.json({ error: "Missing id or session_id" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.query(
      "SELECT session_id FROM reviews WHERE review_id = $1",
      [reviewId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    if (!existing.rows[0].session_id || existing.rows[0].session_id !== sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.query("DELETE FROM reviews WHERE review_id = $1", [reviewId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
