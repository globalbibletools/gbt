-- DropForeignKey
ALTER TABLE "UHBWord" DROP CONSTRAINT "UHBWord_wordId_fkey";

-- CreateTable
CREATE TABLE "BDBEntry" (
    "id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "BDBEntry_pkey" PRIMARY KEY ("id")
);
