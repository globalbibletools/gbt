/*
  Warnings:

  - The primary key for the `BDBStrongsMapping` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "BDBStrongsMapping" DROP CONSTRAINT "BDBStrongsMapping_pkey",
ALTER COLUMN "bdbId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BDBStrongsMapping_pkey" PRIMARY KEY ("bdbId");
