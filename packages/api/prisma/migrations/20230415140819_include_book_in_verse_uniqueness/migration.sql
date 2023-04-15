/*
  Warnings:

  - A unique constraint covering the columns `[bookId,chapter,number]` on the table `Verse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Verse_chapter_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "Verse_bookId_chapter_number_key" ON "Verse"("bookId", "chapter", "number");
