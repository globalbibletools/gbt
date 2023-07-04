-- CreateEnum
CREATE TYPE "LanguageRole" AS ENUM ('ADMIN', 'TRANSLATOR', 'VIEWER');

-- CreateTable
CREATE TABLE "LanguageMemberRole" (
    "userId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "role" "LanguageRole" NOT NULL,

    CONSTRAINT "LanguageMemberRole_pkey" PRIMARY KEY ("languageId","userId","role")
);

-- AddForeignKey
ALTER TABLE "LanguageMemberRole" ADD CONSTRAINT "LanguageMemberRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageMemberRole" ADD CONSTRAINT "LanguageMemberRole_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
