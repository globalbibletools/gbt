/*
  Warnings:

  - You are about to drop the column `strongs` on the `BDBEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BDBEntry" DROP COLUMN "strongs";

-- AlterTable
ALTER TABLE "BDBStrongsMapping" ADD COLUMN     "entry" TEXT;
