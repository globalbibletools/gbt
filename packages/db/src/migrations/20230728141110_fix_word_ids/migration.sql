-- We have to remove these constraints so that we can mess with ids without violating them.
ALTER TABLE IF EXISTS public."Gloss" DROP CONSTRAINT IF EXISTS "Gloss_pkey";
ALTER TABLE IF EXISTS public."Gloss" DROP CONSTRAINT IF EXISTS "Gloss_wordId_fkey";
ALTER TABLE IF EXISTS public."Word" DROP CONSTRAINT IF EXISTS "Word_pkey";
-- For both words and glosses we have to extract the last two digits, decrement them, and then ensure they are padding with up to one 0
UPDATE "Word"
SET "id" = CONCAT(
    SUBSTRING("id", 1, 8),
    LPAD(
      CAST((CAST(SUBSTRING("id", 9, 2) AS INT) - 1) AS TEXT),
      2,
      '0'
    )
  );
UPDATE "Gloss"
SET "wordId" = CONCAT(
    SUBSTRING("wordId", 1, 8),
    LPAD(
      CAST(
        (CAST(SUBSTRING("wordId", 9, 2) AS INT) - 1) AS TEXT
      ),
      2,
      '0'
    )
  );
-- Now we can add the constraints back because all ids have been updated and constraints are satisfied again.
ALTER TABLE IF EXISTS public."Word"
ADD CONSTRAINT "Word_pkey" PRIMARY KEY (id);
ALTER TABLE IF EXISTS public."Gloss"
ADD CONSTRAINT "Gloss_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES public."Word" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE IF EXISTS public."Gloss"
ADD CONSTRAINT "Gloss_pkey" PRIMARY KEY ("wordId", "languageId");