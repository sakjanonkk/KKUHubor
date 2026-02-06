import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    // Auth Check
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const body = await req.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const query = `UPDATE tag_requests SET status = 'rejected' WHERE request_id = $1`;
      await db.query(query, [requestId]);
      return NextResponse.json({ success: true, message: "Request rejected" });
    }

    if (action === "approve") {
      // 1. Get request details
      const reqResult = await db.query(
        `SELECT course_id, tag_name FROM tag_requests WHERE request_id = $1`,
        [requestId]
      );

      if (reqResult.rowCount === 0) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }

      const { course_id, tag_name } = reqResult.rows[0];

      // 2. Add tag to courses table (prevent duplicate)
      const updateQuery = `
            UPDATE courses
            SET tags = array_append(COALESCE(tags, '{}'), $1)
            WHERE course_id = $2 AND NOT ($1 = ANY(COALESCE(tags, '{}')))
        `;
      await db.query(updateQuery, [tag_name, course_id]);

      // 3. Update request status
      await db.query(
        `UPDATE tag_requests SET status = 'approved' WHERE request_id = $1`,
        [requestId]
      );

      return NextResponse.json({
        success: true,
        message: "Request approved and tag added",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process tag request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
