WITH "Word" AS (
	SELECT substring("UHBWord"."strong" from 'H\d{4}\w?') AS "strong" FROM "UHBWord"
	WHERE substring("UHBWord"."strong" from 'H\d{4}\w?') IS NOT NULL
),
"Lemma" AS (
	SELECT "strong", COUNT("strong") FROM "Word"
	GROUP BY "strong"
	ORDER BY "strong" ASC
)
SELECT sim.strong, MAX(sim.count) FROM "Lemma" AS "ext"
JOIN "Lemma" AS "sim" ON LENGTH(sim.strong) = 5 AND SUBSTRING(ext.strong, 0, 6) = sim.strong
WHERE LENGTH(ext.strong) = 6
GROUP BY sim.strong