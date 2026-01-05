import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing Request ID" },
        { status: 400 }
      );
    }

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
    console.error("Approve failed:", error);
    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}
