WITH word AS (
	SELECT
		"Word".id,
		normalize(translate(replace("OSWord".text, '/', ''), U&'\05a8\0599\0020', ''),NFC) AS "ostext",
		regexp_replace(regexp_replace("OSWord".strong, '(\w/)*', ''), ' |\+', '') AS "osstrong",
		"OSWord".strong AS "osstrongorig",
		normalize(translate("Word".text, U&'\05c3\05be\05a8\0599\005d\005b\0029\0028\0020\05c0', ''),NFC) AS "ourtext",
		"Word".text AS "ourtextorig",
		regexp_replace(regexp_replace("Word"."formId", 'H0*', ''), '-.+', '') AS "ourstrong"
	FROM "OSWord"
-- 	LEFT JOIN "UHBWord" ON "UHBWord"."id" = "Word"."id"
	FULL OUTER JOIN "Word" ON "OSWord"."wordId" = "Word"."id"
	ORDER BY "Word"."id"
)
SELECT * FROM word
WHERE id LIKE '01%'
AND ostext <> ourtext
-- AND id LIKE '01030011%'
-- AND (
-- 	word.osstrong <> word.uhbstrong 
-- 	OR (regexp_replace(word.osstrong, '[^0-9]', '') <> word.ourstrong AND '????' <> word.ourstrong)
-- )

