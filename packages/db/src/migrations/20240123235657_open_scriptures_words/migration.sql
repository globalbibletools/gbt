-- CreateTable
CREATE TABLE "OSWord" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "strong" TEXT NOT NULL,
    "morph" TEXT NOT NULL,
    "type" TEXT,
    "wordId" TEXT,

    CONSTRAINT "OSWord_pkey" PRIMARY KEY ("id")
);
