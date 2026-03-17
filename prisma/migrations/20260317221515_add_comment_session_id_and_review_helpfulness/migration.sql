-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "session_id" VARCHAR(255);

-- CreateTable
CREATE TABLE "review_helpfulness" (
    "vote_id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "vote" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpfulness_pkey" PRIMARY KEY ("vote_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_helpfulness_review_id_session_id_key" ON "review_helpfulness"("review_id", "session_id");

-- AddForeignKey
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("review_id") ON DELETE CASCADE ON UPDATE NO ACTION;
