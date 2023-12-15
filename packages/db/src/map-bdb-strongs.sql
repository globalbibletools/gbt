UPDATE "BDBStrongsMapping"
SET entry = final_mapping.entry_id
FROM (
	SELECT "BDBEntry".id AS entry_id, bdb_mapping.id AS mapping_id
	FROM (
		SELECT
			"BDBStrongsMapping"."bdbId",
			"BDBStrongsMapping".strongs,
			regexp_replace(
				translate(translate("BDBStrongsMapping".word, U&'\05ba', U&'\05b9'),U&'\0098', ''),
				'^[\u0020\u0590-\u05CF]+',
				''
			) AS word,
			"BDBStrongsMapping".id,
			CAST(substring("BDBStrongsMapping"."bdbId" from 4) AS INT) >= 9264 AS is_aramaic
		FROM "BDBStrongsMapping"
	) AS bdb_mapping
	LEFT JOIN "BDBEntry" ON
		normalize(bdb_mapping.word, NFC) = normalize("BDBEntry".word, NFC)
		AND (
			(bdb_mapping.is_aramaic AND "BDBEntry".id >=11012)
			OR (NOT bdb_mapping.is_aramaic AND "BDBEntry".id < 11012)
		)
	WHERE "BDBEntry".id IS NOT NULL
) AS final_mapping
WHERE "BDBStrongsMapping".id = final_mapping.mapping_id

UPDATE "BDBStrongsMapping"
SET entry = '17'
WHERE id = 16;

UPDATE "BDBStrongsMapping"
SET entry = '20'
WHERE id = 18;

UPDATE "BDBStrongsMapping"
SET entry = '35'
WHERE id = 36;

UPDATE "BDBStrongsMapping"
SET entry = '141'
WHERE id = 121;

UPDATE "BDBStrongsMapping"
SET entry = (id + 20)::text
WHERE 130 <= id AND id <= 132;

UPDATE "BDBStrongsMapping"
SET entry = '158'
WHERE id = 138;

UPDATE "BDBStrongsMapping"
SET entry = '216'
WHERE id = 188;

UPDATE "BDBStrongsMapping"
SET entry = '277'
WHERE id = 250;

UPDATE "BDBStrongsMapping"
SET entry = '297'
WHERE id = 264;

UPDATE "BDBStrongsMapping"
SET entry = '312'
WHERE id = 278;

UPDATE "BDBStrongsMapping"
SET entry = '350'
WHERE id = 316;

UPDATE "BDBStrongsMapping"
SET entry = '363'
WHERE id = 327;

UPDATE "BDBStrongsMapping"
SET entry = '436'
WHERE id = 387 OR id = 388;

UPDATE "BDBStrongsMapping"
SET entry = '456'
WHERE id = 403;

UPDATE "BDBStrongsMapping"
SET entry = '466'
WHERE id = 410;

UPDATE "BDBStrongsMapping"
SET entry = '472'
WHERE id = 416;
