/*
  Warnings:

  - A unique constraint covering the columns `[bookId,chapter,number]` on the table `Verse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Verse_chapter_number_key";

-- CreateTable
CREATE TABLE "VerseTranslation" (
    "verseId" INTEGER NOT NULL,
    "languageId" UUID NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "VerseTranslation_pkey" PRIMARY KEY ("verseId","languageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verse_bookId_chapter_number_key" ON "Verse"("bookId", "chapter", "number");

-- AddForeignKey
ALTER TABLE "VerseTranslation" ADD CONSTRAINT "VerseTranslation_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerseTranslation" ADD CONSTRAINT "VerseTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
