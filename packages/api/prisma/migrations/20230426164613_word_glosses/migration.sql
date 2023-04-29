-- CreateTable
CREATE TABLE "Gloss" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "gloss" TEXT NOT NULL,

    CONSTRAINT "Gloss_pkey" PRIMARY KEY ("wordId","languageId")
);

-- AddForeignKey
ALTER TABLE "Gloss" ADD CONSTRAINT "Gloss_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gloss" ADD CONSTRAINT "Gloss_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
