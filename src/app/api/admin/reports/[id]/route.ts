import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const { id } = await params;
    await db.query("DELETE FROM reports WHERE report_id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const { id } = await params;
    await db.query(
      "UPDATE reports SET status = 'dismissed' WHERE report_id = $1",
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to dismiss report:", error);
    return NextResponse.json({ error: "Failed to dismiss report" }, { status: 500 });
  }
}
