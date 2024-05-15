-- CreateIndex
CREATE INDEX "Footnote_phraseId_idx" ON "Footnote"("phraseId");

-- CreateIndex
CREATE INDEX "Gloss_phraseId_idx" ON "Gloss"("phraseId");

-- CreateIndex
CREATE INDEX "Phrase_languageId_idx" ON "Phrase"("languageId");

-- CreateIndex
CREATE INDEX "PhraseWord_wordId_idx" ON "PhraseWord"("wordId");

-- CreateIndex
CREATE INDEX "TranslatorNote_phraseId_idx" ON "TranslatorNote"("phraseId");

-- CreateIndex
CREATE INDEX "Word_verseId_idx" ON "Word"("verseId");
