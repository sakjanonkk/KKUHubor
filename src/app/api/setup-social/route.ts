import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // 1. Create comments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        review_id INT REFERENCES reviews(review_id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_name VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Alter review_likes table
    // Check if session_id column exists
    const checkColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='review_likes' AND column_name='session_id';
    `);

    if (checkColumn.rows.length === 0) {
      await db.query(`
        ALTER TABLE review_likes 
        ALTER COLUMN user_id DROP NOT NULL;
      `);

      await db.query(`
        ALTER TABLE review_likes 
        ADD COLUMN session_id VARCHAR(255);
      `);

      // Add unique constraint for (review_id, session_id) so anonymous users can't spam likes
      // We might need to handle existing constraints first, but for now lets assume simple addition
      // Just in case, let's drop old constraint if it heavily relies on user_id being unique per review?
      // The original schema likely had UNIQUE(user_id, review_id).
      // We should probably add a constraint for session_id too.
      await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_like_session ON review_likes (review_id, session_id);
      `);
    }

    return NextResponse.json({ message: "Social tables setup successfully" });
  } catch (error: any) {
    console.error("Setup Social DB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
