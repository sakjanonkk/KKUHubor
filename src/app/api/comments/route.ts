import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schema
const commentSchema = z.object({
  reviewId: z.number().positive("Review ID must be a positive number"),
  content: z.string().min(1, "Content is required").max(1000, "Content too long"),
  authorName: z.string().max(100, "Name too long").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validated = commentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues.map(e => e.message) },
        { status: 400 }
      );
    }

    const { reviewId, content, authorName } = validated.data;

    const query = `
      INSERT INTO comments (review_id, content, author_name)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [reviewId, content, authorName || "Anonymous"];
    const result = await db.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Comment API Error:", error);
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
  } catch (error: any) {
    console.error("Fetch Comments Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
