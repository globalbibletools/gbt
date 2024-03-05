/*
  Warnings:

  - You are about to drop the column `active_expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `idle_expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `UserAuthentication` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAuthentication" DROP CONSTRAINT "UserAuthentication_user_id_fkey";

-- DropIndex
DROP INDEX "Session_user_id_idx";

-- AlterTable
DELETE FROM "Session";

ALTER TABLE "Session" RENAME COLUMN "user_id" TO "userId";

ALTER TABLE "Session" DROP COLUMN "active_expires",
DROP COLUMN "idle_expires",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "hashedPassword" TEXT;

UPDATE "User"
SET "hashedPassword" = "UserAuthentication".hashed_password,
email = SPLIT_PART("UserAuthentication".id, ':', 2)
FROM "UserAuthentication"
WHERE "UserAuthentication"."user_id" = "User".id AND "UserAuthentication"."id" LIKE 'username:%';

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "UserAuthentication";

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
