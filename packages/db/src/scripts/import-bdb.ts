import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import { BDBEntry, PrismaClient } from '@prisma/client';

const BASE_URL = 'https://www.sefaria.org/api/texts';
const START_REF_HEB = 'BDB%2C_%D7%90.1';
const BREAK_START = 'BDB, עפר';
const BREAK_END = 'BDB, עֹפֶרֶת';
const START_REF_AR = 'BDB_Aramaic%2C_אֵב.1';
const STRONGS_MAPPING_FILE = path.join(
  __dirname,
  '../../../../data/bdbToStrongsMapping.csv'
);

const client = new PrismaClient();

function get(url: string) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(JSON.parse(data));
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

interface RawBDBData {
  text: string[];
  next?: string;
  titleVariants?: string[];
}

interface BDBData {
  word: string;
  content: string[];
}

async function* downloadBDB(): AsyncGenerator<BDBData, void, unknown> {
  let ref: string | undefined = START_REF_HEB;

  while (ref) {
    const url = `${BASE_URL}/${ref}?multiple=${ref === BREAK_START ? 6 : 100}`;
    const entries = (await get(url)) as RawBDBData[];

    let entry: RawBDBData | undefined;
    for (entry of entries) {
      yield {
        word: entry.titleVariants?.[0] ?? 'unknown',
        content: entry.text,
      };
    }

    ref = ref === BREAK_START ? BREAK_END : entry?.next;
  }
}

async function* downloadBDBAramaic(): AsyncGenerator<BDBData, void, unknown> {
  let ref: string | undefined = START_REF_AR;

  while (ref) {
    const url = `${BASE_URL}/${ref}?multiple=100`;
    const entries = (await get(url)) as RawBDBData[];

    let entry: RawBDBData | undefined;
    for (entry of entries) {
      yield {
        word: entry.titleVariants?.[0] ?? 'unknown',
        content: entry.text,
      };
    }

    ref = entry?.next;
  }
}

async function importStrongsMapping() {
  const data = fs.readFileSync(STRONGS_MAPPING_FILE).toString();
  const rows = data.split('\n').slice(1);
  for (const row of rows) {
    const cells = row.split(',');
    await client.bDBStrongsMapping.create({
      data: {
        bdbId: cells[0],
        strongs: cells[1],
        word: cells[2],
      },
    });
  }
}

async function importBdb() {
  let id = 1;
  let entries: BDBEntry[] = [];
  for await (const entry of downloadBDB()) {
    if (entry.content.length !== 1) {
      console.log(id, entry.word, entry.content.length);
    }

    entries.push({
      id: id++,
      word: entry.word,
      content: entry.content[0],
      strongs: null,
    });

    if (id % 100 === 0) {
      await client.bDBEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });
      entries = [];
    }
  }

  for await (const entry of downloadBDBAramaic()) {
    if (entry.content.length !== 1) {
      console.log(id, entry.word, entry.content.length);
    }

    entries.push({
      id: id++,
      word: entry.word,
      content: entry.content[0],
      strongs: null,
    });

    if (id % 100 === 0) {
      await client.bDBEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });
      entries = [];
    }
  }

  await client.bDBEntry.createMany({
    data: entries,
    skipDuplicates: true,
  });
}

async function resolveMatchingEntries() {
  await client.$executeRaw`
    WITH bdb_mapping AS (
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
    ),
    final_mapping AS (
    	SELECT bdb_mapping.strongs, "BDBEntry".id  FROM bdb_mapping
    	LEFT JOIN "BDBEntry" ON
    		normalize(bdb_mapping.word, NFC) = normalize("BDBEntry".word, NFC)
    		AND (
    			(bdb_mapping.is_aramaic AND "BDBEntry".id >=11012)
    			OR (NOT bdb_mapping.is_aramaic AND "BDBEntry".id < 11012)
    		)
    	WHERE "BDBEntry".id IS NOT NULL
    	ORDER BY COALESCE(bdb_mapping.word, "BDBEntry".word) asc
    )
    UPDATE "BDBEntry"
    SET strongs = final_mapping.strongs
    FROM final_mapping
    WHERE "BDBEntry".id = final_mapping.id
  `;
}

async function run() {
  await importStrongsMapping();
  await importBdb();
  await resolveMatchingEntries();
}

run().catch(console.error);
