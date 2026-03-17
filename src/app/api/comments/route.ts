import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schemas
const commentSchema = z.object({
  reviewId: z.number().positive("Review ID must be a positive number"),
  content: z.string().min(1, "Content is required").max(1000, "Content too long"),
  authorName: z.string().max(100, "Name too long").optional(),
  sessionId: z.string().max(255).optional(),
});

const updateCommentSchema = z.object({
  comment_id: z.number().positive(),
  session_id: z.string().min(1),
  content: z.string().min(1).max(1000),
});

const deleteCommentSchema = z.object({
  comment_id: z.number().positive(),
  session_id: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validated = commentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { reviewId, content, authorName, sessionId } = validated.data;

    const query = `
      INSERT INTO comments (review_id, content, author_name, session_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [reviewId, content, authorName || "Anonymous", sessionId || null];
    const result = await db.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Comment API Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
  }

  try {
    const query = `
      SELECT * FROM comments
      WHERE review_id = $1
      ORDER BY created_at ASC
    `;
    const result = await db.query(query, [reviewId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Fetch Comments Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const validated = updateCommentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { comment_id, session_id, content } = validated.data;

    // Verify ownership
    const ownerCheck = await db.query(
      `SELECT session_id FROM comments WHERE comment_id = $1`,
      [comment_id]
    );

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (!ownerCheck.rows[0].session_id || ownerCheck.rows[0].session_id !== session_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await db.query(
      `UPDATE comments SET content = $1 WHERE comment_id = $2 RETURNING *`,
      [content, comment_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update Comment Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const validated = deleteCommentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { comment_id, session_id } = validated.data;

    // Verify ownership
    const ownerCheck = await db.query(
      `SELECT session_id FROM comments WHERE comment_id = $1`,
      [comment_id]
    );

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (!ownerCheck.rows[0].session_id || ownerCheck.rows[0].session_id !== session_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await db.query(
      `DELETE FROM comments WHERE comment_id = $1`,
      [comment_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Comment Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
