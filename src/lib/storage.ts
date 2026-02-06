import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "summaries");

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
};

export function isAllowedType(mimeType: string): boolean {
  return mimeType in ALLOWED_TYPES;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function saveFile(
  file: File,
  courseCode: string
): Promise<string> {
  const ext = ALLOWED_TYPES[file.type] || "";
  const storedName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, courseCode);
  await ensureDir(dir);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, storedName), buffer);

  return storedName;
}

export async function deleteFile(
  storedName: string,
  courseCode: string
): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, courseCode, storedName);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be deleted
  }
}

export function getFilePath(storedName: string, courseCode: string): string {
  return path.join(UPLOAD_DIR, courseCode, storedName);
}
