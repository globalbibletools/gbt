-- DropForeignKey
ALTER TABLE "GlossHistoryEntry" DROP CONSTRAINT "GlossHistoryEntry_languageId_fkey";

-- DropForeignKey
ALTER TABLE "GlossHistoryEntry" DROP CONSTRAINT "GlossHistoryEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "GlossHistoryEntry" DROP CONSTRAINT "GlossHistoryEntry_wordId_fkey";

-- DropForeignKey
ALTER TABLE "GlossHistoryEntry" DROP CONSTRAINT "GlossHistoryEntry_pkey";

-- Rename table
ALTER TABLE "GlossHistoryEntry" RENAME TO "GlossEvent";

ALTER TABLE "GlossEvent"
  ADD COLUMN "id" SERIAL PRIMARY KEY,
  ADD COLUMN "phraseId" INTEGER;

UPDATE "GlossEvent"
  SET "phraseId" = data."phraseId"
FROM (
  SELECT e."languageId", e."wordId", ph.id AS "phraseId"
  FROM "GlossEvent" AS e
  JOIN "PhraseWord" AS phw ON phw."wordId" = e."wordId"
  JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
  WHERE ph."languageId" = e."languageId"
    AND ph."deletedAt" IS NULL
) AS data
WHERE "GlossEvent"."languageId" = data."languageId"
  AND "GlossEvent"."wordId" = data."wordId";

-- Update after migrating data
ALTER TABLE "GlossEvent"
  ALTER COLUMN "phraseId" SET NOT NULL,
  DROP COLUMN "wordId",
  DROP COLUMN "languageId";

-- AddForeignKey
ALTER TABLE "GlossEvent" ADD CONSTRAINT "GlossEvent_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossEvent" ADD CONSTRAINT "GlossEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
