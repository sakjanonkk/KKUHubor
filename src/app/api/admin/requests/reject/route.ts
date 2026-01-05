import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await req.json();

    await db.query(`DELETE FROM course_requests WHERE request_id = $1`, [
      requestId,
    ]);

    return NextResponse.json({ success: true, message: "Request rejected." });
  } catch (error) {
    console.error("Reject failed:", error);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
