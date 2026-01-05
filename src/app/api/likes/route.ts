import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { reviewId, sessionId } = await req.json();

    if (!reviewId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if like exists
    const checkQuery = `
      SELECT like_id 
      FROM review_likes 
      WHERE review_id = $1 AND session_id = $2
    `;
    const existingLike = await db.query(checkQuery, [reviewId, sessionId]);

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        "DELETE FROM review_likes WHERE review_id = $1 AND session_id = $2",
        [reviewId, sessionId]
      );
    } else {
      // Like
      await db.query(
        "INSERT INTO review_likes (review_id, session_id) VALUES ($1, $2)",
        [reviewId, sessionId]
      );
    }

    // Get updated count
    const countQuery = `
      SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1
    `;
    const countResult = await db.query(countQuery, [reviewId]);
    const newCount = Number(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      liked: existingLike.rows.length === 0,
      count: newCount,
    });
  } catch (error: any) {
    console.error("Like API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
