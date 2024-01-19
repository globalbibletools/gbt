/*
  Warnings:

  - You are about to drop the column `note` on the `TranslatorNote` table. All the data in the column will be lost.
  - Added the required column `content` to the `TranslatorNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TranslatorNote" DROP COLUMN "note",
ADD COLUMN     "content" TEXT NOT NULL;
