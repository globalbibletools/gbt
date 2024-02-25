/*
  Warnings:

  - Added the required column `userId` to the `LanguageImportJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LanguageImportJob" ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "LanguageImportJob" ADD CONSTRAINT "LanguageImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
