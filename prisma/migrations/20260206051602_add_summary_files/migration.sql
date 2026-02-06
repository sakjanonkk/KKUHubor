-- CreateTable
CREATE TABLE "summary_files" (
    "file_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "uploader_name" VARCHAR(100) DEFAULT 'Anonymous',
    "title" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "stored_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "session_id" VARCHAR(255),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_files_pkey" PRIMARY KEY ("file_id")
);

-- AddForeignKey
ALTER TABLE "summary_files" ADD CONSTRAINT "summary_files_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
