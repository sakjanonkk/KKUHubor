import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Check if admin exists
    const check = await db.query(
      "SELECT * FROM users WHERE username = 'admin'"
    );
    if (check.rows.length === 0) {
      // Create admin user (using plain text for demo as no bcrypt installed)
      await db.query(`
        INSERT INTO users (username, password_hash, role, email)
        VALUES ('admin', 'admin', 'admin', 'admin@example.com')
      `);
      return NextResponse.json({ message: "Admin user created: admin/admin" });
    }
    return NextResponse.json({ message: "Admin user already exists" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
