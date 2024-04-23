DO
$$
DECLARE
	lang_id UUID = '018bba5e-1a95-fd70-37e1-fc2289701fff'::uuid;
BEGIN
	WITH word AS (
		SELECT DISTINCT ON("wordId") *, ROW_NUMBER() OVER () AS r FROM (
			SELECT "wordId" FROM "Gloss"
			WHERE "phraseId" IS NULL
				AND "languageId" = lang_id
			UNION
			SELECT "wordId" FROM "TranslatorNote"
			WHERE "phraseId" IS NULL
				AND "languageId" = lang_id
			UNION
			SELECT "wordId" FROM "Footnote"
			WHERE "phraseId" IS NULL
				AND "languageId" = lang_id
		) AS combined
	),
	phrase AS (
		INSERT INTO "Phrase" ("languageId")
		SELECT '018bba5e-1a95-fd70-37e1-fc2289701fff'::uuid FROM word
		RETURNING "id", "languageId"
	),
	phrase_word AS (
		INSERT INTO "PhraseWord" ("phraseId", "wordId")
		SELECT phrase.id, word."wordId" FROM word
		JOIN (SELECT *, ROW_NUMBER() OVER () AS r FROM phrase) AS phrase
			ON phrase.r = word.r
		RETURNING "phraseId", "wordId"
	),
	gloss_update AS (
		UPDATE "Gloss"
		SET "phraseId" = phrase_word."phraseId"
		FROM phrase_word
		WHERE phrase_word."wordId" = "Gloss"."wordId" AND "Gloss"."languageId" = lang_id
	),
	footnote_update AS (
		UPDATE "Footnote"
		SET "phraseId" = phrase_word."phraseId"
		FROM phrase_word
		WHERE phrase_word."wordId" = "Footnote"."wordId" AND "Footnote"."languageId" = lang_id
	)
	UPDATE "TranslatorNote"
	SET "phraseId" = phrase_word."phraseId"
	FROM phrase_word
	WHERE phrase_word."wordId" = "TranslatorNote"."wordId" AND "TranslatorNote"."languageId" = lang_id;

	raise notice 'Done';
END $$;
