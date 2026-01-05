import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS course_requests (
        request_id SERIAL PRIMARY KEY,
        course_code VARCHAR(50) NOT NULL,
        name_th VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        faculty VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    return NextResponse.json({
      success: true,
      message: "Table 'course_requests' created.",
    });
  } catch (error) {
    console.error("Setup failed:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
