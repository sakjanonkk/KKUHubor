import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    // Auth Check
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const { id } = await params;

    // First delete associated reports (foreign key constraint)
    await db.query("DELETE FROM reports WHERE review_id = $1", [id]);

    // Then delete the review
    await db.query("DELETE FROM reviews WHERE review_id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
