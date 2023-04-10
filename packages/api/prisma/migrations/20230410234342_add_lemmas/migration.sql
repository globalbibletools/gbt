/*
  Warnings:

  - You are about to drop the column `chapterId` on the `Verse` table. All the data in the column will be lost.
  - You are about to drop the `Chapter` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chapter,number]` on the table `Verse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookId` to the `Verse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapter` to the `Verse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Verse" DROP CONSTRAINT "Verse_chapterId_fkey";

-- DropIndex
DROP INDEX "Verse_chapterId_number_key";

-- AlterTable
ALTER TABLE "Verse" DROP COLUMN "chapterId",
ADD COLUMN     "bookId" INTEGER NOT NULL,
ADD COLUMN     "chapter" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Chapter";

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "verseId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LemmaForm" (
    "id" TEXT NOT NULL,
    "grammar" TEXT NOT NULL,
    "lemmaId" TEXT NOT NULL,

    CONSTRAINT "LemmaForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lemma" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Lemma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_verseId_order_key" ON "Word"("verseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_chapter_number_key" ON "Verse"("chapter", "number");

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_formId_fkey" FOREIGN KEY ("formId") REFERENCES "LemmaForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LemmaForm" ADD CONSTRAINT "LemmaForm_lemmaId_fkey" FOREIGN KEY ("lemmaId") REFERENCES "Lemma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
