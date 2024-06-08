-- AlterTable
ALTER TABLE "Phrase" ADD COLUMN     "createdAt" TIMESTAMP(3),
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AddForeignKey
ALTER TABLE "Phrase" ADD CONSTRAINT "Phrase_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phrase" ADD CONSTRAINT "Phrase_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
