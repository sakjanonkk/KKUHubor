import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schema
const reportSchema = z.object({
  review_id: z.number().positive("Review ID must be a positive number"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500, "Reason too long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validated = reportSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.issues.map(e => e.message) },
        { status: 400 }
      );
    }

    const { review_id, reason } = validated.data;

    // Insert into DB
    const query = `
      INSERT INTO reports (review_id, reason)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [review_id, reason];
    const result = await db.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error reporting review:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
