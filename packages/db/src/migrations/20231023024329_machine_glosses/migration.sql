-- CreateTable
CREATE TABLE "MachineGloss" (
    "wordId" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "gloss" TEXT,

    CONSTRAINT "MachineGloss_pkey" PRIMARY KEY ("wordId","languageId")
);

-- AddForeignKey
ALTER TABLE "MachineGloss" ADD CONSTRAINT "MachineGloss_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineGloss" ADD CONSTRAINT "MachineGloss_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
