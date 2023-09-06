-- CreateTable
CREATE TABLE "LanguageImportJob" (
    "languageId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "succeeded" BOOLEAN,

    CONSTRAINT "LanguageImportJob_pkey" PRIMARY KEY ("languageId")
);

-- AddForeignKey
ALTER TABLE "LanguageImportJob" ADD CONSTRAINT "LanguageImportJob_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
