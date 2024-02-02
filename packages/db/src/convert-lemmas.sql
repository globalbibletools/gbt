WITH conversion AS (
	SELECT
		"Word"."id",
		"Word"."text",
		"LemmaForm"."lemmaId",
		"LemmaForm"."grammar",
		substring("UHBWord"."strong" from 'H\d{4}\w?') AS "estrong"
	FROM "Word"
	JOIN "LemmaForm" ON "Word"."formId" = "LemmaForm"."id"
	JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
	WHERE substring("UHBWord"."strong" from 'H\d{4}\w?') <> "lemmaId"
	ORDER BY "Word"."id"
),
lemma AS (
	SELECT "estrong", COUNT(*) FROM conversion
	GROUP BY "estrong"
)
SELECT "estrong" AS lemma_id FROM lemma
LEFT JOIN "Lemma" ON "Lemma".id = "estrong"
WHERE "Lemma".id IS NULL
ORDER BY "estrong";

WITH conversion AS (
	SELECT
		"Word"."id",
		"Word"."text",
		"LemmaForm"."lemmaId",
		"LemmaForm"."grammar",
		substring("UHBWord"."strong" from 'H\d{4}\w?') AS "estrong"
	FROM "Word"
	JOIN "LemmaForm" ON "Word"."formId" = "LemmaForm"."id"
	JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
	WHERE substring("UHBWord"."strong" from 'H\d{4}\w?') <> "lemmaId"
	ORDER BY "Word"."id"
),
lemma_form AS (
	SELECT "estrong", "grammar", COUNT(*) FROM conversion
	GROUP BY "estrong", "grammar"
)
SELECT lemma_form.estrong AS lemma_id, lemma_form.grammar FROM lemma_form
LEFT JOIN "LemmaForm" ON "LemmaForm"."lemmaId" = "estrong" AND "LemmaForm"."grammar" = lemma_form."grammar"
WHERE "LemmaForm".id IS NULL
ORDER BY "estrong";


SELECT
	"Word"."id",
	"Word"."text",
	"LemmaForm"."id" AS old_id,
	"new_form"."id" AS new_id,
	"LemmaForm"."grammar",
	substring("UHBWord"."strong" from 'H\d{4}\w?') AS "estrong"
FROM "Word"
JOIN "LemmaForm" ON "Word"."formId" = "LemmaForm"."id"
JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
LEFT JOIN "LemmaForm" as new_form ON new_form."lemmaId" = substring("UHBWord"."strong" from 'H\d{4}\w?') AND new_form.grammar = "LemmaForm".grammar
WHERE substring("UHBWord"."strong" from 'H\d{4}\w?') <> "LemmaForm"."lemmaId"
ORDER BY "Word"."id";