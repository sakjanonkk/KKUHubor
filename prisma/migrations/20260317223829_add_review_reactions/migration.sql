-- CreateTable
CREATE TABLE "review_reactions" (
    "reaction_id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "reaction_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_reactions_pkey" PRIMARY KEY ("reaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_reactions_review_id_session_id_key" ON "review_reactions"("review_id", "session_id");

-- AddForeignKey
ALTER TABLE "review_reactions" ADD CONSTRAINT "review_reactions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("review_id") ON DELETE CASCADE ON UPDATE NO ACTION;
