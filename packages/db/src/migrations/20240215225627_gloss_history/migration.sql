-- CreateTable
CREATE TABLE "GlossHistory" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" UUID,
    "gloss" TEXT,
    "state" "GlossState",

    CONSTRAINT "GlossHistory_pkey" PRIMARY KEY ("wordId","languageId","timestamp")
);

-- AddForeignKey
ALTER TABLE "GlossHistory" ADD CONSTRAINT "GlossHistory_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossHistory" ADD CONSTRAINT "GlossHistory_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossHistory" ADD CONSTRAINT "GlossHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
