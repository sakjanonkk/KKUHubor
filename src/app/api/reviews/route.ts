import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schema
const reviewSchema = z.object({
  course_id: z.number().positive("Course ID must be a positive number"),
  reviewer_name: z.string().max(100, "Name too long").optional(),
  grade_received: z.string().min(1, "Grade is required").max(5),
  semester: z.string().min(1, "Semester is required").max(20),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content too long"),
  session_id: z.string().max(255).optional(),
  avatar_style: z.string().max(50).optional(),
});

const updateSchema = z.object({
  review_id: z.number().positive(),
  session_id: z.string().min(1),
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
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { course_id, reviewer_name, grade_received, semester, content, session_id, avatar_style } = validated.data;

    const query = `
      INSERT INTO reviews (course_id, reviewer_name, grade_received, semester, content, session_id, avatar_style, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [
      course_id,
      reviewer_name || "Anonymous",
      grade_received,
      semester,
      content,
      session_id || null,
      avatar_style || null,
    ];

    const result = await db.query(query, values);

    // Convert keys to match TypeScript interface (camelCase)
    const newReview = result.rows[0];
    const formattedReview = {
      id: newReview.review_id,
      courseId: newReview.course_id,
      reviewerName: newReview.reviewer_name,
      gradeReceived: newReview.grade_received,
      semester: newReview.semester,
      content: newReview.content,
      createdAt: newReview.created_at,
      sessionId: newReview.session_id,
      avatarStyle: newReview.avatar_style,
      likeCount: 0,
    };

    return NextResponse.json(formattedReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error instanceof Error ? error.message : "Unknown error");
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

    const { review_id, session_id, grade_received, semester, content } = validated.data;

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
        grade_received = COALESCE($1, grade_received),
        semester = COALESCE($2, semester),
        content = COALESCE($3, content)
      WHERE review_id = $4 RETURNING *`,
      [grade_received, semester, content, review_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

const deleteSchema = z.object({
  id: z.number().positive(),
  session_id: z.string().min(1),
});

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const validated = deleteSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id: reviewId, session_id: sessionId } = validated.data;

    // Verify ownership
    const existing = await db.query(
      "SELECT session_id FROM reviews WHERE review_id = $1",
      [reviewId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    if (!sessionId || !existing.rows[0].session_id || existing.rows[0].session_id !== sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.query("DELETE FROM reviews WHERE review_id = $1", [reviewId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
