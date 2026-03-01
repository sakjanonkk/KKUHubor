import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";
import { z } from "zod";

const rejectSchema = z.object({
  requestId: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const body = await req.json();
    const validated = rejectSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { requestId } = validated.data;

    await db.query(`DELETE FROM course_requests WHERE request_id = $1`, [
      requestId,
    ]);

    return NextResponse.json({ success: true, message: "Request rejected." });
  } catch (error) {
    console.error("Reject failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
