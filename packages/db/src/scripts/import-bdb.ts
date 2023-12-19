import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { BDBEntry, PrismaClient, ResourceCode } from '@prisma/client';

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

const STRONGS_MAP: { [id: number]: number | null } = {
  11830: 32,
  11776: 31,
  11775: null,
  11739: 32,
  11738: null,
  11677: 33,
  11652: 32,
  11611: 31,
  11477: 30,
  11474: 29,
  11431: 28,
  11429: 29,
  11406: 26,
  11237: 25,
  11162: 24,
  11161: null,
  11158: 25,
  11145: 24,
  11050: 23,
  10896: 21,
  10831: 22,
  10830: null,
  10752: 23,
  10604: 22,
  10602: 21,
  10407: 20,
  10126: 19,
  10125: null,
  9905: 20,
  9478: 19,
  9477: null,
  9458: 20,
  9457: null,
  9455: 21,
  9454: null,
  9394: 22,
  9393: null,
  9360: 23,
  9073: 22,
  8040: 21,
  7600: 20,
  7528: 21,
  7071: 20,
  6872: 19,
  6687: 18,
  6685: 17,
  6684: null,
  6281: 19,
  6134: 18,
  6133: null,
  5909: 19,
  5852: 18,
  5851: null,
  5771: 19,
  5734: 18,
  5720: 17,
  5675: 16,
  5627: 15,
  5606: 14,
  5218: 13,
  5212: 12,
  5195: 11,
  5113: 10,
  4669: 9,
  4555: 8,
  4554: null,
  4524: 9,
  4523: null,
  4273: 10,
  4272: null,
  4152: 11,
  4050: 10,
  4016: 9,
  4015: null,
  3990: 10,
  3989: null,
  3950: 11,
  3949: null,
  3882: 12,
  3875: 10,
  3874: null,
  3450: 11,
  3409: 10,
  3408: null,
  3395: 11,
  3394: null,
  3301: 12,
  3162: 11,
  3160: null,
  3146: 13,
  2771: 12,
  2770: null,
  2716: 13,
  2715: null,
  2560: 14,
  2500: 13,
  2469: 12,
  1974: 11,
  968: 7,
  964: 6,
  717: 5,
  569: 4,
  566: 3,
  565: 2,
  532: 1,
  0: 0,
};

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
  }

  return entries;
}

interface BDBMapping {
  word: string;
  bdbId?: string;
  strongs?: string;
  entry?: number;
}

function importMapping(): BDBMapping[] {
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

  const map_keys = Object.keys(STRONGS_MAP).reverse();

  return bdbEntries.map((e, i) => {
    const entries = mappingRecords.filter((r) => r.bdbId === e.id && r.strongs);
    const add =
      STRONGS_MAP[parseInt(map_keys.find((key) => parseInt(key) <= i + 1)!)];
    const entry = add === null ? undefined : i + 1 + add;
    if (entries.length > 0) {
      return {
        id: i + 1,
        bdbId: e.id,
        word: entries.map((e) => e.word).join(','),
        strongs: entries.map((e) => e.strongs).join(','),
        entry,
      };
    } else {
      return {
        id: i + 1,
        bdbId: e.id,
        word: e.word,
        entry,
      };
    }
  });
}

function processEntry(entry: string): string {
  return entry
    .replaceAll(/<(\/?)big>(?:<\/?big>)?/g, '<$1strong>')
    .replaceAll(/<\/?a[^>]*>/g, '');
}

async function run() {
  const mapping = importMapping();
  const bdb = await importBdb();

  const data = mapping
    .flatMap((m) => {
      if (m.strongs) {
        return m.strongs.split(',').map((strongs) => ({
          ...m,
          strongs,
          entry: m.entry ? bdb[m.entry - 1] : undefined,
        }));
      } else {
        return;
      }
    })
    .filter((entry) => !!entry && !!entry.entry && !!entry.strongs);

  await client.lemma.createMany({
    data: Array.from(new Set(data.map((entry) => entry!.strongs))).map((l) => ({
      id: l,
    })),
    skipDuplicates: true,
  });

  await client.lemmaResource.createMany({
    data: data.map((d) => ({
      lemmaId: d!.strongs,
      content: processEntry(d!.entry!.content),
      resourceCode: ResourceCode.BDB,
    })),
    skipDuplicates: true,
  });
}

run().catch(console.error);
