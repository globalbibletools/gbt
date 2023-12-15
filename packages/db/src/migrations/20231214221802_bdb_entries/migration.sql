/*
  Warnings:

  - Added the required column `content` to the `BDBEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BDBEntry" ADD COLUMN     "content" TEXT NOT NULL;
