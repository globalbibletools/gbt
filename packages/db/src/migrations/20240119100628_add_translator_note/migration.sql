-- CreateTable
CREATE TABLE "TranslatorNote" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "TranslatorNote_pkey" PRIMARY KEY ("wordId","languageId")
);

-- AddForeignKey
ALTER TABLE "TranslatorNote" ADD CONSTRAINT "TranslatorNote_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslatorNote" ADD CONSTRAINT "TranslatorNote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslatorNote" ADD CONSTRAINT "TranslatorNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
