/*
  Warnings:

  - The `entry` column on the `BDBStrongsMapping` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BDBStrongsMapping" DROP COLUMN "entry",
ADD COLUMN     "entry" INTEGER;
