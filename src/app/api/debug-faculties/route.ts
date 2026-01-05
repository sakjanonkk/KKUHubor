import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT * FROM faculties");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
