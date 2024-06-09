/*
  Warnings:

  - Made the column `createdAt` on table `Phrase` required. This step will fail if there are existing NULL values in that column.

*/

UPDATE "Phrase"
  SET "createdAt" = COALESCE(data.timestamp, '2024-02-01')
FROM (
  SELECT ph.id, e.timestamp FROM "Phrase" AS ph
  LEFT JOIN "GlossEvent" AS e ON e."phraseId" = ph.id
) AS data
WHERE data.id = "Phrase".id;

-- AlterTable
ALTER TABLE "Phrase" ALTER COLUMN "createdAt" SET NOT NULL;
