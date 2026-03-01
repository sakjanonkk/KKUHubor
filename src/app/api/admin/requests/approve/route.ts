import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";
import { z } from "zod";

const approveSchema = z.object({
  requestId: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const body = await req.json();
    const validated = approveSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { requestId } = validated.data;

    // Transaction
    await db.query("BEGIN");

    // 1. Get Request Data
    const requestResult = await db.query(
      `SELECT * FROM course_requests WHERE request_id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const reqData = requestResult.rows[0];

    // 2. Insert into courses
    await db.query(
      `INSERT INTO courses (course_code, name_th, name_en, faculty_id) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (course_code) DO NOTHING`,
      [
        reqData.course_code,
        reqData.name_th,
        reqData.name_en,
        reqData.faculty_id,
      ]
    );

    // 3. Delete from requests
    await db.query(`DELETE FROM course_requests WHERE request_id = $1`, [
      requestId,
    ]);

    await db.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Course approved and added.",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Approve failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}
