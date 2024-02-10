-- CreateTable
CREATE TABLE "Footnote" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Footnote_pkey" PRIMARY KEY ("wordId","languageId")
);

-- AddForeignKey
ALTER TABLE "Footnote" ADD CONSTRAINT "Footnote_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footnote" ADD CONSTRAINT "Footnote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footnote" ADD CONSTRAINT "Footnote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
