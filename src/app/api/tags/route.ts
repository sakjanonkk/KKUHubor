import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, newTag } = body;

    if (!courseId || !newTag) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tag = newTag.trim();

    if (tag.length === 0 || tag.length > 20) {
      return NextResponse.json(
        { error: "Tag must be between 1 and 20 characters" },
        { status: 400 }
      );
    }

    // Insert into tag_requests table
    const query = `
      INSERT INTO tag_requests (course_id, tag_name, status)
      VALUES ($1, $2, 'pending')
      RETURNING request_id, tag_name
    `;

    const result = await db.query(query, [courseId, tag]);

    return NextResponse.json({
      success: true,
      message: "Tag request submitted for review",
      tag: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to submit tag request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
