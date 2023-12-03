PREPARE shift (TEXT, TEXT, INT) AS
	UPDATE "UHBWord"
	SET "wordId" = LPAD((CAST("id" AS BIGINT) + $3)::text, 10, '0')
	WHERE CAST("id" AS BIGINT) >= CAST($1 AS BIGINT) AND CAST("id" AS BIGINT) < CAST($2 AS BIGINT);
PREPARE move (TEXT, TEXT) AS
	UPDATE "UHBWord" 
	SET "wordId" = $2
	WHERE "id" = $1;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 2)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0103001104 AND CAST("id" AS BIGINT) < 0103001200;


UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 2)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0200400205 AND CAST("id" AS BIGINT) < 0200400300;

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '0202100812';
UPDATE "UHBWord" 
SET "wordId" = '0202100812'
WHERE "id" = '0202100814';
UPDATE "UHBWord" 
SET "wordId" = '0202100813'
WHERE "id" = '0202100813';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0202100815 AND CAST("id" AS BIGINT) < 0202100900;

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '0203501112';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0203501114 AND CAST("id" AS BIGINT) < 0203501200;


UPDATE "UHBWord" 
SET "wordId" = '0402301306'
WHERE "id" = '0402301305';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0402301307 AND CAST("id" AS BIGINT) < 0402301400;


UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0500502105 AND CAST("id" AS BIGINT) < 0500502200;

UPDATE "UHBWord" 
SET "wordId" = '0503300218'
WHERE "id" = '0503300216';


UPDATE "UHBWord" 
SET "wordId" = '0600900713'
WHERE "id" = '0600900712';
UPDATE "UHBWord" 
SET "wordId" = '0600900714'
WHERE "id" = '0600900713';
UPDATE "UHBWord" 
SET "wordId" = '0600900712'
WHERE "id" = '0600900714';
UPDATE "UHBWord" 
SET "wordId" = '0600900715'
WHERE "id" = '0600900715';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0601802404 AND CAST("id" AS BIGINT) < 0601802500;

UPDATE "UHBWord" 
SET "wordId" = '0602400314'
WHERE "id" = '0602400313';
UPDATE "UHBWord" 
SET "wordId" = '0602400313'
WHERE "id" = '0602400314';


UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0701602504 AND CAST("id" AS BIGINT) < 0701602600;

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '0701901303';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0701901304 AND CAST("id" AS BIGINT) < 0701901400;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0702001315 AND CAST("id" AS BIGINT) < 0702001400;

UPDATE "UHBWord" 
SET "wordId" = '0800300507'
WHERE "id" = '0800300506';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0800301206 AND CAST("id" AS BIGINT) < 0800301300;

UPDATE "UHBWord" 
SET "wordId" = '0800301407'
WHERE "id" = '0800301408';
UPDATE "UHBWord" 
SET "wordId" = '0800301408'
WHERE "id" = '0800301407';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0800301709 AND CAST("id" AS BIGINT) < 0800301800;

UPDATE "UHBWord" 
SET "wordId" = '0800400607'
WHERE "id" = '0800400606';
UPDATE "UHBWord" 
SET "wordId" = '0800400606'
WHERE "id" = '0800400607';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0800400608 AND CAST("id" AS BIGINT) < 0800400700;

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '0900301815';
UPDATE "UHBWord" 
SET "wordId" = '0900301814'
WHERE "id" = '0900301814';
UPDATE "UHBWord" 
SET "wordId" = '0900301815'
WHERE "id" = '0900301816';

UPDATE "UHBWord" 
SET "wordId" = '0900900103'
WHERE "id" = '0900900105';
UPDATE "UHBWord" 
SET "wordId" = '0900900104'
WHERE "id" = '0900900103';

UPDATE "UHBWord"
SET "wordId" = NULL
WHERE "id" = '0901801404';
UPDATE "UHBWord"
SET "wordId" = '0901801404'
WHERE "id" = '0901801405';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0901801406 AND CAST("id" AS BIGINT) < 0901801500;

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '0901802204';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0901802205 AND CAST("id" AS BIGINT) < 0901802300;

UPDATE "UHBWord" 
SET "wordId" = '0902000207'
WHERE "id" = '0902000209';
UPDATE "UHBWord" 
SET "wordId" = '0902000209'
WHERE "id" = '0902000207';
UPDATE "UHBWord" 
SET "wordId" = '0902000210'
WHERE "id" = '0902000208';
UPDATE "UHBWord" 
SET "wordId" = '0902000208'
WHERE "id" = '0902000210';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 2)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902000211 AND CAST("id" AS BIGINT) < 0902000300;

UPDATE "UHBWord" 
SET "wordId" = '0902002409'
WHERE "id" = '0902002408';
UPDATE "UHBWord" 
SET "wordId" = '0902002410'
WHERE "id" = '0902002409';
UPDATE "UHBWord" 
SET "wordId" = '0902002411'
WHERE "id" = '0902002411';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 4122 + 100000)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902004223 AND CAST("id" AS BIGINT) < 0902004300;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 100)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902100101 AND CAST("id" AS BIGINT) < 0902101500;

UPDATE "UHBWord" 
SET "wordId" = '0902101217'
WHERE "id" = '0902101118';
UPDATE "UHBWord" 
SET "wordId" = '0902101218'
WHERE "id" = '0902101117';

UPDATE "UHBWord" 
SET "wordId" = '0902101220'
WHERE "id" = '0902101121';
UPDATE "UHBWord" 
SET "wordId" = '0902101221'
WHERE "id" = '0902101120';

UPDATE "UHBWord" 
SET "wordId" = '0902101408'
WHERE "id" = '0902101307';
UPDATE "UHBWord" 
SET "wordId" = '0902101407'
WHERE "id" = '0902101308';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 12)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902101501 AND CAST("id" AS BIGINT) < 0902101600;

UPDATE "UHBWord" 
SET "wordId" = '0902201303'
WHERE "id" = '0902201302';
UPDATE "UHBWord" 
SET "wordId" = '0902201302'
WHERE "id" = '0902201303';

UPDATE "UHBWord" 
SET "wordId" = '0902201505'
WHERE "id" = '0902201504';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902201506 AND CAST("id" AS BIGINT) < 0902201600;

UPDATE "UHBWord" 
SET "wordId" = '0902400808'
WHERE "id" = '0902400806';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902400809 AND CAST("id" AS BIGINT) < 0902400900;

UPDATE "UHBWord" 
SET "wordId" = '0902800818'
WHERE "id" = '0902800817';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 0902800819 AND CAST("id" AS BIGINT) < 0902800900;


UPDATE "UHBWord" 
SET "wordId" = '1000301206'
WHERE "id" = '1000301207';
UPDATE "UHBWord" 
SET "wordId" = '1000301207'
WHERE "id" = '1000301206';

UPDATE "UHBWord" 
SET "wordId" = NULL
WHERE "id" = '1000500814';
UPDATE "UHBWord" 
SET "wordId" = '1000500815'
WHERE "id" = '1000500815';
UPDATE "UHBWord" 
SET "wordId" = '1000500814'
WHERE "id" = '1000500816';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1000500815 AND CAST("id" AS BIGINT) < 1000500900;

UPDATE "UHBWord" 
SET "wordId" = '1001400729'
WHERE "id" = '1001400728';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1001400730 AND CAST("id" AS BIGINT) < 1001400800;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1001602309 AND CAST("id" AS BIGINT) < 1001602400;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1001802019 AND CAST("id" AS BIGINT) < 1001802100;

UPDATE "UHBWord" 
SET "wordId" = '1001900619'
WHERE "id" = '1001900620';
UPDATE "UHBWord" 
SET "wordId" = '1001900620'
WHERE "id" = '1001900619';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1001904010 AND CAST("id" AS BIGINT) < 1001904100;

UPDATE "UHBWord"
SET "wordId" = NULL
WHERE CAST("id" AS BIGINT) >= 1001904013 AND CAST("id" AS BIGINT) < 1001904016;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 2)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1001904016 AND CAST("id" AS BIGINT) < 1001904100;

UPDATE "UHBWord" 
SET "wordId" = '1002100603'
WHERE "id" = '1002100602';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT))::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1002100604 AND CAST("id" AS BIGINT) < 1002100613;

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) + 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1002101226 AND CAST("id" AS BIGINT) < 1002101300;

UPDATE "UHBWord" 
SET "wordId" = '1002101602'
WHERE "id" = '1002101601';
UPDATE "UHBWord" 
SET "wordId" = '1002101601'
WHERE "id" = '1002101602';
UPDATE "UHBWord" 
SET "wordId" = '1002101601'
WHERE "id" = '1002101603';

UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 1)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1002101604 AND CAST("id" AS BIGINT) < 1002101700;


UPDATE "UHBWord"
SET "wordId" = NULL
WHERE CAST("id" AS BIGINT) >= 1002300811 AND CAST("id" AS BIGINT) < 1002300815;
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 5)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1002300815 AND CAST("id" AS BIGINT) < 1002300817;
UPDATE "UHBWord" 
SET "wordId" = '1002300813'
WHERE "id" = '1002300817';
UPDATE "UHBWord"
SET "wordId" = NULL
WHERE CAST("id" AS BIGINT) >= 1002300818 AND CAST("id" AS BIGINT) < 1002300821;
UPDATE "UHBWord" 
SET "wordId" = '1002300814'
WHERE "id" = '1002300821';
UPDATE "UHBWord"
SET "wordId" = LPAD((CAST("id" AS BIGINT) - 7)::text, 10, '0')
WHERE CAST("id" AS BIGINT) >= 1002300822 AND CAST("id" AS BIGINT) < 1002300900;
UPDATE "UHBWord" 
SET "wordId" = '1002300812'
WHERE "id" = '1002300820';

UPDATE "UHBWord" 
SET "wordId" = '1002300819'
WHERE "id" = '1002300827';
UPDATE "UHBWord" 
SET "wordId" = '1002300820'
WHERE "id" = '1002300826';


EXECUTE shift ('1101202102', '1101202200', 1);
EXECUTE shift ('1101701420', '1101701500', 0);
EXECUTE move  ('1101701418', '1101701419');
EXECUTE move  ('1101701507', '1101701507');
EXECUTE move  ('1101701508', '1101701510');
EXECUTE move  ('1101701509', '1101701511');

EXECUTE shift ('1200302415', '1200302500', 0);
EXECUTE move  ('1200302413', '1200302414');
EXECUTE shift ('1200602517', '1200602600', -1);
EXECUTE move  ('1201601709', '1201601710');
EXECUTE move  ('1201601710', '1201601711');
EXECUTE shift ('1201601712', '1201601800', 0);
EXECUTE move  ('1201802727', '1201802729');
EXECUTE shift ('1201903110', '1201903200', 1);
EXECUTE shift ('1201903709', '1201903800', 1);
EXECUTE move  ('1202301006', '1202301007');
EXECUTE move  ('1202301007', '1202301006');
EXECUTE shift ('1202301009', '1202301100', 0);
EXECUTE move  ('1202301007', '1202301008');
EXECUTE move  ('1202401514', '1202401514');
EXECUTE move  ('1202401515', '1202401515');

EXECUTE move  ('1300900409', '1300900410');
EXECUTE move  ('1300900410', '1300900411');
EXECUTE move  ('1300900414', '1300900409');
EXECUTE shift ('1300900411', '1300900414', 1);
EXECUTE move  ('1300900413', NULL);
EXECUTE move  ('1300900415', NULL);
EXECUTE move  ('1300900416', NULL);
EXECUTE move  ('1300900417', '1300900414');
EXECUTE move  ('1300900418', '1300900415');
EXECUTE move  ('1301102016', '1301102017');
EXECUTE move  ('1301102018', '1301102016');
EXECUTE move  ('1301102017', '1301102018');
EXECUTE move  ('1301102019', '1301102019');
EXECUTE shift ('1301200501', '1301300000', 100);
EXECUTE shift ('1301200407', '1301200500', -6 + 100);
EXECUTE shift ('1301204001', '1301204100', 12);
EXECUTE move  ('1301200507', '1301200606');
EXECUTE move  ('1301200506', '1301200607');
EXECUTE shift ('1301201303', '1301201400', 101);
EXECUTE move  ('1301201514', '1301201613');
EXECUTE move  ('1301201513', '1301201614');
EXECUTE shift ('1301501303', '1301501400', -1);
EXECUTE move  ('1301502409', '1301502410');
EXECUTE move  ('1301502410', '1301502409');
EXECUTE shift ('1301801011', '1301801100', 0);
EXECUTE move  ('1301801009', '1301801010');
EXECUTE shift ('1302000403', '1302000500', -1);
EXECUTE shift ('1302600805', '1302600900', -1);
EXECUTE move  ('1302600816', '1302600814');
EXECUTE shift ('1302701207', '1302701300', 2);

EXECUTE move  ('1401101807', '1401101808');
EXECUTE move  ('1401101808', '1401101809');
EXECUTE shift ('1401101810', '1401101900', 0);
EXECUTE shift ('1402000103', '1402000200', -1);
EXECUTE shift ('1402003502', '1402003600', -1);
EXECUTE shift ('1402400403', '1402400500', -1);
EXECUTE move  ('1402902807', '1402902808');
EXECUTE move  ('1402902808', '1402902807');
EXECUTE shift ('1403000312', '1403000400', -1);
EXECUTE move  ('1403400609', '1403400610');
EXECUTE move  ('1403500401', NULL);
EXECUTE shift ('1403500402', '1403500500', -1);
EXECUTE move  ('1403601409', NULL);
EXECUTE shift ('1403601410', '1403601500', -1);

EXECUTE shift ('1500300502', '1500300600', -1);
EXECUTE move  ('1500501504', '1500501503');
EXECUTE move  ('1500501503', '1500501504');

EXECUTE move  ('1600201317', '1600201318');
EXECUTE move  ('1600201319', '1600201317');
EXECUTE move  ('1600500715', '1600500715');
EXECUTE shift ('1600500717', '1600500800', -1);

EXECUTE move  ('1700400401', '1700400401');
EXECUTE move  ('1700400402', NULL);
EXECUTE shift ('1700400403', '1700400500', -1);

EXECUTE move  ('1800602907', '1800602906');
EXECUTE move  ('1800602906', '1800602907');
EXECUTE move  ('1800700105', '1800700106');
EXECUTE move  ('1800700107', '1800700107');
EXECUTE shift ('1800700108', '1800700200', 0);
EXECUTE move  ('1800903003', '1800903004');
EXECUTE move  ('1800903004', '1800903005');
EXECUTE shift ('1800903006', '1800903100', 0);
EXECUTE move  ('1803800107', '1803800109');
EXECUTE move  ('1803801206', '1803801208');
EXECUTE move  ('1804101202', '1804101203');
EXECUTE shift ('1804101204', '1804101300', 0);
EXECUTE move  ('1804000607', '1804000609');

EXECUTE move  ('1902100111', '1902100110');
EXECUTE shift ('1903000307', '1903000309', 1);
EXECUTE move  ('1903000309', '1903000307');
EXECUTE move  ('1903802008', '1903802009');
EXECUTE shift ('1905501502', '1905501600', 2);
EXECUTE move  ('1908902803', '1908902804');
EXECUTE shift ('1908902805', '1908902900', 0);
EXECUTE shift ('1910600102', '1910600200', -1);

EXECUTE move  ('2000601607', '2000601608');
EXECUTE move  ('2000803503', '2000803502');
EXECUTE move  ('2000803502', NULL);
EXECUTE shift ('2000803504', '2000803600', -1);
EXECUTE move  ('2001702706', '2001702707');
EXECUTE shift ('2001702708', '2001702800', 0);
EXECUTE shift ('2001801704', '2001801706', 1);
EXECUTE move  ('2001801707', '2001801707');
EXECUTE move  ('2001900713', '2001900714');
EXECUTE shift ('2001901901', '2001901903', 1);
EXECUTE shift ('2001901904', '2001902000', 0);
EXECUTE move  ('2002200804', '2002200805');
EXECUTE shift ('2002200806', '2002200900', 0);
EXECUTE move  ('2002201103', '2002201104');
EXECUTE shift ('2002201105', '2002201200', 0);
EXECUTE move  ('2002201408', '2002201409');
EXECUTE move  ('2002300303', NULL);
EXECUTE shift ('2002300304', '2002300400', -1);
EXECUTE shift ('2002302410', '2002302412', 1);

EXECUTE move  ('2100501819', '2100501819');
EXECUTE move  ('2100501820', '2100501820');

EXECUTE move  ('2200800619', '2200800618');

DEALLOCATE shift;
DEALLOCATE move;

