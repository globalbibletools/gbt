/*
  Warnings:

  - A unique constraint covering the columns `[phraseId]` on the table `Footnote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phraseId]` on the table `Gloss` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phraseId]` on the table `TranslatorNote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Footnote" ADD COLUMN     "phraseId" INTEGER;

-- AlterTable
ALTER TABLE "Gloss" ADD COLUMN     "phraseId" INTEGER;

-- AlterTable
ALTER TABLE "TranslatorNote" ADD COLUMN     "phraseId" INTEGER;

-- CreateTable
CREATE TABLE "Phrase" (
    "id" SERIAL NOT NULL,
    "languageId" UUID NOT NULL,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhraseWord" (
    "phraseId" INTEGER NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "PhraseWord_pkey" PRIMARY KEY ("phraseId","wordId")
);
-- DropForeignKey
ALTER TABLE "PhraseWord" DROP CONSTRAINT "PhraseWord_phraseId_fkey";

-- AddForeignKey
ALTER TABLE "PhraseWord" ADD CONSTRAINT "PhraseWord_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Footnote_phraseId_key" ON "Footnote"("phraseId");

-- CreateIndex
CREATE UNIQUE INDEX "Gloss_phraseId_key" ON "Gloss"("phraseId");

-- CreateIndex
CREATE UNIQUE INDEX "TranslatorNote_phraseId_key" ON "TranslatorNote"("phraseId");

-- AddForeignKey
ALTER TABLE "Phrase" ADD CONSTRAINT "Phrase_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseWord" ADD CONSTRAINT "PhraseWord_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseWord" ADD CONSTRAINT "PhraseWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gloss" ADD CONSTRAINT "Gloss_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslatorNote" ADD CONSTRAINT "TranslatorNote_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footnote" ADD CONSTRAINT "Footnote_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
