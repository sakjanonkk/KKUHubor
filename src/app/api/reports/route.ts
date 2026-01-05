import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review_id, reason } = body;

    // Basic validation
    if (!review_id || !reason) {
      return NextResponse.json(
        { error: "Missing review_id or reason" },
        { status: 400 }
      );
    }

    // Insert into DB
    const query = `
      INSERT INTO reports (review_id, reason)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [review_id, reason];
    const result = await db.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error reporting review:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
