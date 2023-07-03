/*
 Warnings:
 
 - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
 
 */
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM (
  'UNVERIFIED',
  'VERIFIED',
  'BOUNCED',
  'COMPLAINED'
);
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
  DROP COLUMN "email",
  ADD COLUMN "emailStatus" "EmailStatus" NOT NULL DEFAULT 'UNVERIFIED';
UPDATE "User"
SET "emailStatus" = 'VERIFIED';