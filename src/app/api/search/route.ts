import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const sql = `
      SELECT course_code, name_th, name_en 
      FROM courses 
      WHERE 
        name_th ILIKE $1 OR 
        name_en ILIKE $1 OR 
        course_code ILIKE $1 
      LIMIT 5
    `;
    const values = [`%${query}%`];
    const result = await db.query(sql, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
