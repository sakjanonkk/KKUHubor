import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getFilePath } from "@/lib/storage";
import fs from "fs/promises";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT sf.file_id, sf.file_name, sf.stored_name, sf.file_type, c.course_code
       FROM summary_files sf
       JOIN courses c ON sf.course_id = c.course_id
       WHERE sf.file_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = result.rows[0];
    const filePath = getFilePath(file.stored_name, file.course_code);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    // Increment download count (fire-and-forget)
    db.query(
      "UPDATE summary_files SET download_count = download_count + 1 WHERE file_id = $1",
      [id]
    ).catch(() => {});

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": file.file_type,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.file_name)}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error downloading summary:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
