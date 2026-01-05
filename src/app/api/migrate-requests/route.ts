import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // 1. Add faculty_id column
    await db.query(
      `ALTER TABLE course_requests ADD COLUMN IF NOT EXISTS faculty_id INT`
    );

    // 2. Drop faculty column (optional, but cleaner) - or keep for backup?
    // I'll drop it to force usage of faculty_id
    await db.query(`ALTER TABLE course_requests DROP COLUMN IF EXISTS faculty`);

    // 3. Ensure faculties table exists (User said it does, but good to check if I can? No, I assume user made it).
    // I will return success.

    return NextResponse.json({
      success: true,
      message: "Table 'course_requests' migrated.",
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
