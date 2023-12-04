SELECT
	"Word"."id",
	"Word"."text",
	"LemmaForm"."lemmaId",
	substring("UHBWord"."strong" from 'H\d{4}\w?') AS "estrong",
	substring("UHBWord"."strong" from 'H\d{4}') AS "strong",
	"UHBWord"."strong" AS "origStrong",
	"UHBWord"."text" AS "refText"
FROM "Word"
JOIN "LemmaForm" ON "Word"."formId" = "LemmaForm"."id"
JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
WHERE substring("UHBWord"."strong" from 'H\d{4}') <> "lemmaId"
AND "lemmaId" <> 'H????'
ORDER BY "Word"."id"

WITH a AS (SELECT
	"lemmaId" || '-' || substring("UHBWord"."strong" from 'H\d{4}\w?') AS "conversion"
FROM "Word"
JOIN "LemmaForm" ON "Word"."formId" = "LemmaForm"."id"
JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
WHERE substring("UHBWord"."strong" from 'H\d{4}\w') <> "lemmaId"
AND "lemmaId" <> 'H????')
SELECT "conversion", COUNT("conversion") AS "count" FROM a
GROUP BY "conversion"
ORDER BY "count" desc