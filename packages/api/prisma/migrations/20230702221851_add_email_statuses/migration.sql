/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'BOUNCED', 'COMPLAINED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'UNVERIFIED';
