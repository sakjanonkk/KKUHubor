import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function POST() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  const token = adminSession?.value;

  // Delete session from database
  if (token && token !== "true") {
    await prisma.adminSession.deleteMany({ where: { token } });
  }

  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
