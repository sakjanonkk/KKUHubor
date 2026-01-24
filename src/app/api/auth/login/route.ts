import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    if (user && user.role === "admin") {
      // Compare password with bcrypt hash
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (isValidPassword) {
        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24, // 1 day
        });

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { error: "Invalid credentials or unauthorized" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
