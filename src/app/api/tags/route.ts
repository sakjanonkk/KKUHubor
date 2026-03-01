import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const tagRequestSchema = z.object({
  courseId: z.number().positive(),
  newTag: z.string().min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = tagRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const tag = validated.data.newTag.trim();
    const courseId = validated.data.courseId;

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
    console.error("Failed to submit tag request:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
