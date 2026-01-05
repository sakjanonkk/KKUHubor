import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      `SELECT faculty_id, name_th FROM faculties ORDER BY name_th ASC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch faculties:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
