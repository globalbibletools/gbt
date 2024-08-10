-- DropIndex
DROP INDEX "Phrase_languageId_idx";

-- DropIndex
DROP INDEX "PhraseWord_wordId_idx";

-- CreateIndex
CREATE INDEX "Phrase_languageId_deletedAt_idx" ON "Phrase"("languageId", "deletedAt") WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "PhraseWord_wordId_phraseId_idx" ON "PhraseWord"("wordId", "phraseId");
