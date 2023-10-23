/*
  Warnings:

  - You are about to drop the `VerseTranslation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerseTranslation" DROP CONSTRAINT "VerseTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "VerseTranslation" DROP CONSTRAINT "VerseTranslation_verseId_fkey";

-- DropTable
DROP TABLE "VerseTranslation";
