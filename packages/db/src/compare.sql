WITH "WordPair" AS (
	SELECT
	  	CAST(COALESCE("Word"."id", "UHBWord"."id") AS BIGINT) AS "id",
	  	"Word".id AS "wordId",
		replace(translate(translate("Word"."text", '()[]', ''), U&'\200d\05A8\0599\05BF\0596\05BD\0597\0594\202a\202c\05A1\05A5\059C\05A3\0592\059E\0595\0591\05C3\05A9\059B\05AE\05A4\05A0', ''), ' ׀', '') AS "wordText",
	  	replace(translate("UHBWord"."text", U&'\200d\2060\05A8\0599\202A\202C\05BF\0596\05BD\0597\0594\202a\202c\05A1\05A5\059C\05A3\0592\059E\0595\0591\05C3\05A9\059B\05AE\05A4\05A0', ''), ' ׀', '') AS "uhbText",
		"Word"."text" AS "wordOrig",
		"UHBWord"."text" AS "uhbOrig",
	  	"UHBWord".id AS "uhbId",
	  	"UHBWord"."wordId" AS "uhbWordId",
	  	"UHBWord"."type" AS "uhbType",
	  	regexp_split_to_array("Word"."text", '( (?!׀)|־)(?!$)') AS "parts"
	FROM "Word"
	FULL JOIN "UHBWord" ON "UHBWord"."wordId" = "Word"."id"
)
SELECT * FROM "WordPair"
-- Filter out new testament
WHERE "WordPair"."id" < 2400000000 AND "WordPair"."id" >= 2300000000
-- Filter out break symbols
AND ("WordPair"."wordText" NOT IN ('פ', 'ס') OR "WordPair"."wordText" IS NULL)

AND (
	("WordPair"."wordId" IS NULL OR "WordPair"."uhbText" IS NULL)
	OR (
		"WordPair"."wordText" <> "WordPair"."uhbText"
		AND NOT (translate("WordPair"."uhbText", '־', '') = ANY(regexp_split_to_array("WordPair"."wordText", '( (?!׀)|־)(?!$)')))
	)
)

-- AND "id"::text LIKE '6009007%'

ORDER BY "id"