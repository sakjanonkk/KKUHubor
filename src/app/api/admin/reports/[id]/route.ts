import { NextResponse } from "next/server";
import db from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM reports WHERE report_id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
