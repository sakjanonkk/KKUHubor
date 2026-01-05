import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { z } from "zod";

const courseSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  nameTH: z.string().min(1, "Thai name is required"),
  nameEN: z.string().optional(),
  facultyId: z.number().min(1, "Faculty is required"),
});

export async function POST(req: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = courseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { courseCode, nameTH, nameEN, facultyId } = validated.data;

    await db.query(
      `INSERT INTO courses (course_code, name_th, name_en, faculty_id) 
       VALUES ($1, $2, $3, $4)`,
      [courseCode, nameTH, nameEN || "", facultyId]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to add course:", error);
    return NextResponse.json(
      { error: "Failed to add course" },
      { status: 500 }
    );
  }
}
