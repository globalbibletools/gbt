-- CreateEnum
CREATE TYPE "GlossState" AS ENUM ('APPROVED', 'UNAPPROVED');

-- AlterTable
ALTER TABLE "Gloss" ADD COLUMN     "state" "GlossState" NOT NULL DEFAULT 'UNAPPROVED';
