import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Verify admin session from cookies
 * Returns true if admin session exists, false otherwise
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  return adminSession?.value === "true";
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
