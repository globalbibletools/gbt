/*
  Warnings:

  - The primary key for the `BDBStrongsMapping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `BDBStrongsMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BDBStrongsMapping" DROP CONSTRAINT "BDBStrongsMapping_pkey",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "BDBStrongsMapping_pkey" PRIMARY KEY ("id");
