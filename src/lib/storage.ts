import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || "kkuhubor";

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

function getKey(courseCode: string, storedName: string): string {
  return `summaries/${courseCode}/${storedName}`;
}

export async function saveFile(
  file: File,
  courseCode: string
): Promise<string> {
  const ext = ALLOWED_TYPES[file.type] || "";
  const storedName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: getKey(courseCode, storedName),
      Body: buffer,
      ContentType: file.type,
    })
  );

  return storedName;
}

export async function deleteFile(
  storedName: string,
  courseCode: string
): Promise<void> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: getKey(courseCode, storedName),
      })
    );
  } catch {
    // File may already be deleted
  }
}

export async function getFileBuffer(
  storedName: string,
  courseCode: string
): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: getKey(courseCode, storedName),
    })
  );
  const bytes = await response.Body!.transformToByteArray();
  return Buffer.from(bytes);
}
