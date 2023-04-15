-- CreateTable
CREATE TABLE "VerseTranslation" (
    "verseId" TEXT NOT NULL,
    "langId" TEXT NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "VerseTranslation_pkey" PRIMARY KEY ("verseId","langId")
);
