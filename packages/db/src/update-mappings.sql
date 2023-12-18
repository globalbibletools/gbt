UPDATE "BDBStrongsMapping" AS mapping
SET strongs = 'H0176a'
WHERE entry = 188;
UPDATE "BDBStrongsMapping" AS mapping
SET strongs = 'H0176b'
WHERE entry = 202;

WITH summary AS (
	SELECT mapping.strongs, COUNT(mapping.strongs), array_agg(mapping.entry) AS entries FROM "BDBStrongsMapping" as mapping
	GROUP BY mapping.strongs
	-- HAVING COUNT(mapping.strongs) >= 2
	ORDER BY mapping.strongs
),
mapped AS (
	SELECT aramaic.entries[1] AS entry, other.strongs AS strongs FROM summary AS aramaic
	JOIN summary AS other ON other.strongs <> aramaic.strongs AND aramaic.entries[1] = ANY(other.entries)
	WHERE ARRAY_LENGTH(aramaic.entries, 1) = 1 AND aramaic.entries[1] >= 11016
	AND 11016 > ANY(other.entries)
)
DELETE FROM "BDBStrongsMapping" as mapping
USING mapped
WHERE mapped.strongs = mapping.strongs AND mapped.entry = mapping.entry;

UPDATE "BDBStrongsMapping" AS mapping
SET strongs = 'H0193a'
WHERE entry = 222;
UPDATE "BDBStrongsMapping" AS mapping
SET strongs = 'H0193b'
WHERE entry = 223;