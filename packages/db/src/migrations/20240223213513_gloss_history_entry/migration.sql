-- CreateEnum
CREATE TYPE "GlossSource" AS ENUM ('USER', 'IMPORT');

-- CreateTable
CREATE TABLE "GlossHistoryEntry" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "gloss" TEXT,
    "state" "GlossState",
    "source" "GlossSource" NOT NULL,

    CONSTRAINT "GlossHistoryEntry_pkey" PRIMARY KEY ("wordId","languageId","timestamp")
);

-- AddForeignKey
ALTER TABLE "GlossHistoryEntry" ADD CONSTRAINT "GlossHistoryEntry_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossHistoryEntry" ADD CONSTRAINT "GlossHistoryEntry_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossHistoryEntry" ADD CONSTRAINT "GlossHistoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
