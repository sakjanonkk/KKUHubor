import { NextResponse } from "next/server";
import db from "@/lib/db";
import { deleteFile } from "@/lib/storage";
import { requireAdminAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    // Check admin or ownership
    const adminAuth = await requireAdminAuth();
    const isAdmin = adminAuth === null;

    if (!isAdmin && !sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // Get file record
    const fileResult = await db.query(
      `SELECT sf.file_id, sf.stored_name, sf.session_id, c.course_code
       FROM summary_files sf
       JOIN courses c ON sf.course_id = c.course_id
       WHERE sf.file_id = $1`,
      [id]
    );

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fileResult.rows[0];

    // Verify ownership (unless admin)
    if (!isAdmin) {
      if (!file.session_id || file.session_id !== sessionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Delete from filesystem
    await deleteFile(file.stored_name, file.course_code);

    // Delete from database
    await db.query("DELETE FROM summary_files WHERE file_id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting summary:", error);
    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
