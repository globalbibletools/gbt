-- CreateIndex
CREATE INDEX "LemmaForm_lemmaId_idx" ON "LemmaForm"("lemmaId");

-- CreateIndex
CREATE INDEX "LemmaResource_lemmaId_idx" ON "LemmaResource"("lemmaId");

-- CreateIndex
CREATE INDEX "Word_formId_idx" ON "Word"("formId");
