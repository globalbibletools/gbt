/*
  Warnings:

  - You are about to drop the column `languageId` on the `Footnote` table. All the data in the column will be lost.
  - You are about to drop the column `wordId` on the `Footnote` table. All the data in the column will be lost.
  - You are about to drop the column `languageId` on the `Gloss` table. All the data in the column will be lost.
  - You are about to drop the column `wordId` on the `Gloss` table. All the data in the column will be lost.
  - You are about to drop the column `languageId` on the `TranslatorNote` table. All the data in the column will be lost.
  - You are about to drop the column `wordId` on the `TranslatorNote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Footnote" DROP CONSTRAINT "Footnote_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Footnote" DROP CONSTRAINT "Footnote_wordId_fkey";

-- DropForeignKey
ALTER TABLE "Gloss" DROP CONSTRAINT "Gloss_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Gloss" DROP CONSTRAINT "Gloss_wordId_fkey";

-- DropForeignKey
ALTER TABLE "TranslatorNote" DROP CONSTRAINT "TranslatorNote_languageId_fkey";

-- DropForeignKey
ALTER TABLE "TranslatorNote" DROP CONSTRAINT "TranslatorNote_wordId_fkey";

-- DropIndex
DROP INDEX "Footnote_wordId_languageId_key";

-- DropIndex
DROP INDEX "Gloss_wordId_languageId_key";

-- DropIndex
DROP INDEX "TranslatorNote_wordId_languageId_key";

-- AlterTable
ALTER TABLE "Footnote" DROP COLUMN "languageId",
DROP COLUMN "wordId";

-- AlterTable
ALTER TABLE "Gloss" DROP COLUMN "languageId",
DROP COLUMN "wordId";

-- AlterTable
ALTER TABLE "TranslatorNote" DROP COLUMN "languageId",
DROP COLUMN "wordId";
