-- CreateTable
CREATE TABLE "BDBStrongsMapping" (
    "bdbId" INTEGER NOT NULL,
    "strongs" TEXT NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "BDBStrongsMapping_pkey" PRIMARY KEY ("bdbId")
);
