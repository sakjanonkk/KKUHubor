import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const requestSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  nameTH: z.string().min(1, "Thai name is required"),
  nameEN: z.string().optional(),
  facultyId: z.number().min(1, "Faculty is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = requestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { courseCode, nameTH, nameEN, facultyId } = validated.data;

    const result = await db.query(
      `INSERT INTO course_requests (course_code, name_th, name_en, faculty_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING request_id`,
      [courseCode, nameTH, nameEN || "", facultyId]
    );

    return NextResponse.json(
      { success: true, requestId: result.rows[0].request_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
