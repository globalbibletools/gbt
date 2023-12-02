-- CreateTable
CREATE TABLE "UHBWord" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "strong" TEXT NOT NULL,
    "morph" TEXT NOT NULL,
    "type" TEXT,
    "wordId" TEXT,

    CONSTRAINT "UHBWord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UHBWord" ADD CONSTRAINT "UHBWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;
