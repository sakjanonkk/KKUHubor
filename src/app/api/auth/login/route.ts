import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { prisma } from "@/lib/database";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        // Generate secure session token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Clean up expired sessions for this user
        await prisma.adminSession.deleteMany({
          where: { userId: user.user_id, expiresAt: { lt: new Date() } },
        });

        // Store session token in database
        await prisma.adminSession.create({
          data: {
            token,
            userId: user.user_id,
            expiresAt,
          },
        });

        // Set HTTP-only cookie with the token
        const cookieStore = await cookies();
        cookieStore.set("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
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
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
