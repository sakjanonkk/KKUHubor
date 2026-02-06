import { NextResponse } from "next/server";
import db from "@/lib/db";
import { saveFile, isAllowedType, MAX_FILE_SIZE } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const courseId = formData.get("courseId") as string | null;
    const uploaderName = formData.get("uploaderName") as string | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file || !title || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields: file, title, courseId" },
        { status: 400 }
      );
    }

    if (!title.trim() || title.length > 255) {
      return NextResponse.json(
        { error: "Title must be between 1 and 255 characters" },
        { status: 400 }
      );
    }

    if (!isAllowedType(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Accepted: PDF, JPG, PNG, DOCX, PPTX" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    // Get course code for directory structure
    const courseResult = await db.query(
      "SELECT course_code FROM courses WHERE course_id = $1",
      [courseId]
    );
    if (courseResult.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const courseCode = courseResult.rows[0].course_code;

    const storedName = await saveFile(file, courseCode);

    const result = await db.query(
      `INSERT INTO summary_files
        (course_id, uploader_name, title, file_name, stored_name, file_size, file_type, session_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING file_id as id, course_id as "courseId", uploader_name as "uploaderName",
                 title, file_name as "fileName", file_size as "fileSize", file_type as "fileType",
                 download_count as "downloadCount", created_at as "createdAt"`,
      [
        courseId,
        uploaderName?.trim() || "Anonymous",
        title.trim(),
        file.name,
        storedName,
        file.size,
        file.type,
        sessionId || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error uploading summary:", error);
    return NextResponse.json(
      { error: "Failed to upload summary" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId parameter" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `SELECT file_id as id, course_id as "courseId", uploader_name as "uploaderName",
              title, file_name as "fileName", file_size as "fileSize", file_type as "fileType",
              session_id as "sessionId", download_count as "downloadCount", created_at as "createdAt"
       FROM summary_files
       WHERE course_id = $1
       ORDER BY created_at DESC`,
      [courseId]
    );

    return NextResponse.json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}
