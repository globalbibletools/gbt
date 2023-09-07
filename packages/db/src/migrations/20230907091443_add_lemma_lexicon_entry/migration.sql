-- CreateEnum
CREATE TYPE "LexiconCode" AS ENUM ('BDB', 'LSJ', 'STRONGS');

-- CreateTable
CREATE TABLE "LemmaLexiconEntry" (
    "lemmaId" TEXT NOT NULL,
    "lexiconCode" "LexiconCode" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "LemmaLexiconEntry_pkey" PRIMARY KEY ("lemmaId","lexiconCode")
);

-- AddForeignKey
ALTER TABLE "LemmaLexiconEntry" ADD CONSTRAINT "LemmaLexiconEntry_lemmaId_fkey" FOREIGN KEY ("lemmaId") REFERENCES "Lemma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
