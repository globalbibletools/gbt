/*
  Warnings:

  - The primary key for the `Footnote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Gloss` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TranslatorNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[wordId,languageId]` on the table `Footnote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wordId,languageId]` on the table `Gloss` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wordId,languageId]` on the table `TranslatorNote` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phraseId` on table `Footnote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phraseId` on table `Gloss` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phraseId` on table `TranslatorNote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Footnote" DROP CONSTRAINT "Footnote_phraseId_fkey";

-- DropForeignKey
ALTER TABLE "Gloss" DROP CONSTRAINT "Gloss_phraseId_fkey";

-- DropForeignKey
ALTER TABLE "TranslatorNote" DROP CONSTRAINT "TranslatorNote_phraseId_fkey";

-- DropIndex
DROP INDEX "Footnote_phraseId_key";

-- DropIndex
DROP INDEX "Gloss_phraseId_key";

-- DropIndex
DROP INDEX "TranslatorNote_phraseId_key";

-- AlterTable
ALTER TABLE "Footnote" DROP CONSTRAINT "Footnote_pkey",
ALTER COLUMN "phraseId" SET NOT NULL,
ADD CONSTRAINT "Footnote_pkey" PRIMARY KEY ("phraseId");

-- AlterTable
ALTER TABLE "Gloss" DROP CONSTRAINT "Gloss_pkey",
ALTER COLUMN "phraseId" SET NOT NULL,
ADD CONSTRAINT "Gloss_pkey" PRIMARY KEY ("phraseId");

-- AlterTable
ALTER TABLE "TranslatorNote" DROP CONSTRAINT "TranslatorNote_pkey",
ALTER COLUMN "phraseId" SET NOT NULL,
ADD CONSTRAINT "TranslatorNote_pkey" PRIMARY KEY ("phraseId");

-- CreateIndex
CREATE UNIQUE INDEX "Footnote_wordId_languageId_key" ON "Footnote"("wordId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Gloss_wordId_languageId_key" ON "Gloss"("wordId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TranslatorNote_wordId_languageId_key" ON "TranslatorNote"("wordId", "languageId");

-- AddForeignKey
ALTER TABLE "Gloss" ADD CONSTRAINT "Gloss_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslatorNote" ADD CONSTRAINT "TranslatorNote_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footnote" ADD CONSTRAINT "Footnote_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
