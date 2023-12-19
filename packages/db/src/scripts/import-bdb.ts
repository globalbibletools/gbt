import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { BDBEntry, BDBStrongsMapping, PrismaClient } from '@prisma/client';

const BASE_URL = 'https://www.sefaria.org/api/texts';
const START_REF_HEB = 'BDB%2C_%D7%90.1';
const BREAK_START = 'BDB, עפר';
const BREAK_END = 'BDB, עֶפְרַ֫יִן';
const START_REF_AR = 'BDB_Aramaic, אֵב';

const STRONGS_MAPPING_FILE = path.join(
  __dirname,
  '../../../../data/LexicalIndex.xml'
);
const BDB_FILE = path.join(__dirname, '../../../../data/BrownDriverBriggs.xml');

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

    if (ref === BREAK_START) {
      const temp = { word: 'missing', content: ['missing'] };
      yield temp;
      yield temp;
      yield temp;
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

async function importBdb() {
  let id = 1;
  const entries: BDBEntry[] = [];
  for await (const entry of downloadBDB()) {
    if (entry.content.length !== 1) {
      console.log(id, entry.word, entry.content.length);
    }

    entries.push({
      id: id++,
      word: entry.word,
      content: entry.content[0],
    });

    // if (id % 100 === 0) {
    //   await client.bDBEntry.createMany({
    //     data: entries,
    //     skipDuplicates: true,
    //   });
    //   entries = [];
    // }
  }

  for await (const entry of downloadBDBAramaic()) {
    if (entry.content.length !== 1) {
      console.log(id, entry.word, entry.content.length);
    }

    entries.push({
      id: id++,
      word: entry.word,
      content: entry.content[0],
    });

    // if (id % 100 === 0) {
    //   await client.bDBEntry.createMany({
    //     data: entries,
    //     skipDuplicates: true,
    //   });
    //   entries = [];
    // }
  }

  // await client.bDBEntry.createMany({
  //   data: entries,
  //   skipDuplicates: true,
  // });

  return entries;
}

async function importMapping() {
  const parser = new XMLParser({ ignoreAttributes: false });

  const bdbFileString = fs.readFileSync(BDB_FILE).toString();
  const bdbData = parser.parse(bdbFileString);

  const bdbEntries: { word: string; id: string }[] = bdbData.lexicon.part
    .flatMap((part: any) => part.section)
    .flatMap((section: any) => section.entry)
    .map((entry: any) => ({
      word: Array.isArray(entry.w) ? entry.w[0] : entry.w,
      id: entry['@_id'],
    }));

  const mappingFileString = fs.readFileSync(STRONGS_MAPPING_FILE).toString();
  const mappingData = parser.parse(mappingFileString);
  const mappingRecords = [
    ...mappingData.index.part[0].entry.map((entry: any) => ({
      word: entry.w['#text'],
      bdbId: entry.xref['@_bdb'],
      strongs: entry.xref['@_strong']
        ? `H${entry.xref['@_strong'].padStart(4, '0')}${
            entry.xref['@_aug'] ?? ''
          }`
        : undefined,
    })),
    ...mappingData.index.part[1].entry.map((entry: any) => ({
      word: entry.w['#text'],
      bdbId: entry.xref['@_bdb'],
      strongs: entry.xref['@_strong']
        ? `H${entry.xref['@_strong'].padStart(4, '0')}${
            entry.xref['@_aug'] ?? ''
          }`
        : undefined,
    })),
  ];

  const dbData = bdbEntries.map((e, i) => {
    const entries = mappingRecords.filter((r) => r.bdbId === e.id && r.strongs);
    if (entries.length > 0) {
      return {
        id: i + 1,
        bdbId: e.id,
        word: entries.map((e) => e.word).join(','),
        strongs: entries.map((e) => e.strongs).join(','),
      };
    } else {
      return {
        id: i + 1,
        bdbId: e.id,
        word: e.word,
      };
    }
  });

  await client.bDBStrongsMapping.createMany({
    data: dbData,
  });
}

async function run() {
  await importMapping();
  // const bdb = await importBdb();
  // await resolveMatchingEntries();
}

run().catch(console.error);
