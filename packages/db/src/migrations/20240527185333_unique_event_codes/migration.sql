/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `PhraseEventType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PhraseEventType_code_key" ON "PhraseEventType"("code");
