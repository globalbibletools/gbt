WITH strongs_mapping AS (
	SELECT 
		id,
		CAST(SUBSTRING("bdbId" from 4) AS INT) AS bdb_id,
		strongs,
		word,
		entry
	FROM "BDBStrongsMapping"
)
SELECT * FROM strongs_mapping
LEFT JOIN "BDBEntry" AS entry
	ON entry.id = CASE
		WHEN 865 <= bdb_id THEN bdb_id + 110
		WHEN 864 <= bdb_id THEN bdb_id + 108
		WHEN 863 <= bdb_id THEN bdb_id + 105
		WHEN 861 <= bdb_id THEN bdb_id + 103
		WHEN 860 <= bdb_id THEN bdb_id + 102
		WHEN 849 <= bdb_id THEN bdb_id + 101
		WHEN 846 <= bdb_id THEN bdb_id + 100
		WHEN 832 <= bdb_id THEN bdb_id + 99
		WHEN 827 <= bdb_id THEN bdb_id + 98
		WHEN 826 <= bdb_id THEN bdb_id + 96
		WHEN 820 <= bdb_id THEN bdb_id + 94
		WHEN 814 <= bdb_id THEN bdb_id + 93
		WHEN 810 <= bdb_id THEN bdb_id + 92
		WHEN 809 <= bdb_id THEN bdb_id + 91
		WHEN 801 <= bdb_id THEN bdb_id + 92
		WHEN 788 <= bdb_id THEN bdb_id + 90
		WHEN 787 <= bdb_id THEN bdb_id + 89
		WHEN 778 <= bdb_id THEN bdb_id + 88
		WHEN 753 <= bdb_id THEN bdb_id + 86
		WHEN 720 <= bdb_id THEN bdb_id + 85
		WHEN 718 <= bdb_id THEN bdb_id + 83
		WHEN 709 <= bdb_id THEN bdb_id + 80
		WHEN 708 <= bdb_id THEN bdb_id + 79
		WHEN 707 <= bdb_id THEN bdb_id + 78
		WHEN 704 <= bdb_id THEN bdb_id + 77
		WHEN 700 <= bdb_id THEN bdb_id + 76
		WHEN 688 <= bdb_id THEN bdb_id + 75
		WHEN 686 <= bdb_id THEN bdb_id + 74
		WHEN 677 <= bdb_id THEN bdb_id + 73
		WHEN 669 <= bdb_id THEN bdb_id + 72
		WHEN 624 <= bdb_id THEN bdb_id + 71
		WHEN 586 <= bdb_id THEN bdb_id + 70
		WHEN 586 <= bdb_id THEN bdb_id + 69
		WHEN 576 <= bdb_id THEN bdb_id + 68
		WHEN 573 <= bdb_id THEN bdb_id + 67
		WHEN 572 = bdb_id THEN NULL
		WHEN 570 <= bdb_id THEN bdb_id + 68
		WHEN 513 <= bdb_id THEN bdb_id + 66
		WHEN 509 <= bdb_id THEN bdb_id + 64
		WHEN 508 <= bdb_id THEN bdb_id + 63
		WHEN 507 <= bdb_id THEN bdb_id + 62
		WHEN 506 <= bdb_id THEN bdb_id + 61
		WHEN 495 <= bdb_id THEN bdb_id + 60
		WHEN 475 <= bdb_id THEN bdb_id + 58
		WHEN 470 <= bdb_id THEN bdb_id + 57
		WHEN 469 <= bdb_id THEN bdb_id + 56
		WHEN 461 <= bdb_id THEN bdb_id + 55
		WHEN 438 <= bdb_id THEN bdb_id + 53
		WHEN 413 <= bdb_id THEN bdb_id + 52
		WHEN 397 <= bdb_id THEN bdb_id + 51
		WHEN 395 <= bdb_id THEN bdb_id + 49
		WHEN 393 <= bdb_id THEN bdb_id + 47
		WHEN 389 <= bdb_id THEN bdb_id + 46
		WHEN 378 <= bdb_id THEN bdb_id + 45
		WHEN 375 <= bdb_id THEN bdb_id + 39
		WHEN 352 <= bdb_id THEN bdb_id + 37
		WHEN 351 <= bdb_id THEN bdb_id + 36
		WHEN 339 <= bdb_id THEN bdb_id + 35
		WHEN 332 <= bdb_id THEN bdb_id + 36
		WHEN 317 <= bdb_id THEN bdb_id + 35
		WHEN 287 <= bdb_id THEN bdb_id + 34
		WHEN 276 <= bdb_id THEN bdb_id + 33
		WHEN 274 <= bdb_id THEN bdb_id + 30
		WHEN 259 <= bdb_id THEN bdb_id + 29
		WHEN 253 <= bdb_id THEN bdb_id + 28
		WHEN 142 <= bdb_id THEN bdb_id + 25
		WHEN 101 <= bdb_id THEN bdb_id + 22
		WHEN 79 <= bdb_id THEN bdb_id + 19
		WHEN 77 <= bdb_id THEN bdb_id + 17
		WHEN 65 <= bdb_id THEN bdb_id + 16
		WHEN 61 <= bdb_id THEN bdb_id + 15
		WHEN 58 <= bdb_id THEN bdb_id + 13
		WHEN 52 <= bdb_id THEN bdb_id + 12
		WHEN 49 <= bdb_id THEN bdb_id + 11
		WHEN 5 <= bdb_id THEN bdb_id + 2
		WHEN 3 <= bdb_id THEN bdb_id + 1
		WHEN 1 = bdb_id THEN bdb_id
		ELSE 0
	END
WHERE bdb_id >= 850
ORDER BY strongs_mapping.bdb_id