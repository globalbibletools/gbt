SELECT
	"Word"."id",
	"Word"."text",
	"UHBWord"."text" AS "refText",
	regexp_split_to_array(translate("Word"."text", U&'\200d\2060\202a\202c' || '׃[]()', ''), '( (?!׀)|־)(?!$)')
FROM "Word"
JOIN "UHBWord" ON "Word"."id" = "UHBWord"."wordId"
WHERE NOT(translate("UHBWord"."text", U&'\200d\2060\202a\202c' || '־׃', '') = ANY(regexp_split_to_array(translate("Word"."text", U&'\200d\2060\202a\202c' || '׃[]()', ''), '( (?!׀)|־)(?!$)')))
-- AND NOT ("UHBWord"."text" ~* U&'\05a8')
AND (translate("Word"."text", '׃[]()', '') ~* '( |־).')
ORDER BY "Word"."id"


