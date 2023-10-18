-- CreateEnum
CREATE TYPE "TextDirection" AS ENUM ('ltr', 'rtl');
-- AlterTable
ALTER TABLE "Language"
ADD COLUMN "textDirection" "TextDirection" NOT NULL DEFAULT 'ltr';