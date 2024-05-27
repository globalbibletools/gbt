-- CreateTable
CREATE TABLE "PhraseEvent" (
    "id" SERIAL NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "userId" UUID,
    "typeId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "data" JSONB,

    CONSTRAINT "PhraseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhraseEventType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "PhraseEventType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhraseEvent" ADD CONSTRAINT "PhraseEvent_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseEvent" ADD CONSTRAINT "PhraseEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseEvent" ADD CONSTRAINT "PhraseEvent_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PhraseEventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "PhraseEventType" VALUES
  (1, 'Created'),
  (2, 'Removed'),
  (3, 'WordAdded'),
  (4, 'WordRemoved'),
  (5, 'GlossChanged')
