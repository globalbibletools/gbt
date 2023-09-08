-- CreateEnum
CREATE TYPE "ResourceCode" AS ENUM ('BDB', 'LSJ', 'STRONGS');

-- CreateTable
CREATE TABLE "LemmaResource" (
    "lemmaId" TEXT NOT NULL,
    "resourceCode" "ResourceCode" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "LemmaResource_pkey" PRIMARY KEY ("lemmaId","resourceCode")
);

-- AddForeignKey
ALTER TABLE "LemmaResource" ADD CONSTRAINT "LemmaResource_lemmaId_fkey" FOREIGN KEY ("lemmaId") REFERENCES "Lemma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
