import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";

/**
 * Verify admin session by checking token against database
 * Returns true if a valid (non-expired) session exists
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  const token = adminSession?.value;

  if (!token || token === "true") {
    return false;
  }

  const session = await prisma.adminSession.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt < new Date()) {
    return false;
  }

  return true;
}

/**
 * Helper to return unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized - Admin access required" },
    { status: 401 }
  );
}

/**
 * Middleware helper for admin routes
 * Call at the start of admin API handlers
 * Returns null if authorized, or a NextResponse to return if unauthorized
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return unauthorizedResponse();
  }
  return null;
}
