import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const NEW_LEMMAS_FILE = path.join(
  __dirname,
  '../../../../data/lemma-conversion/new_lemmas.csv'
);
const NEW_LEMMA_FORMS_FILE = path.join(
  __dirname,
  '../../../../data/lemma-conversion/new_lemma_forms.csv'
);
const WORD_UPDATES_FILE = path.join(
  __dirname,
  '../../../../data/lemma-conversion/word_updates.csv'
);

const CELL_REGEX = /(?:"((?:[^"]|"")*)"|([^",\r\n]*))(?:,|\r|$)/g;

function processCSV(file: string): string[][] {
  const rowStrs = file.trim().split('\n');
  const rows: string[][] = [];
  for (let r = 1; r < rowStrs.length; r++) {
    const row: string[] = [];
    for (const cell of rowStrs[r].matchAll(CELL_REGEX)) {
      row.push(cell[1] ?? cell[2]);
    }
    rows.push(row);
  }
  return rows;
}

async function loadNewLemmas(client: PrismaClient): Promise<void> {
  const data = processCSV(fs.readFileSync(NEW_LEMMAS_FILE).toString());
  await client.lemma.createMany({
    data: data.map((row) => ({
      id: row[0],
    })),
    skipDuplicates: true,
  });
}

async function loadNewLemmaForms(client: PrismaClient): Promise<void> {
  const data = processCSV(fs.readFileSync(NEW_LEMMA_FORMS_FILE).toString());
  for (const row of data) {
    const count = await client.lemmaForm.count({
      where: {
        lemmaId: row[0],
      },
    });
    await client.lemmaForm.create({
      data: {
        id: `${row[0]}-${(count + 1).toString().padStart(3, '0')}`,
        lemmaId: row[0],
        grammar: row[1],
      },
    });
  }
}

async function loadWordLemmaChanges(client: PrismaClient): Promise<void> {
  const data = processCSV(fs.readFileSync(WORD_UPDATES_FILE).toString());
  for (const word of data) {
    await client.word.update({
      data: {
        formId: word[1],
      },
      where: {
        id: word[0],
      },
    });
  }
}

async function removeUnusedLemmas(client: PrismaClient): Promise<void> {
  await client.$executeRaw`
    DELETE FROM "LemmaForm"
    USING (
    	SELECT "LemmaForm".id FROM "LemmaForm"
    	LEFT JOIN "Word" ON "Word"."formId" = "LemmaForm".id
    	WHERE "Word".id IS NULL
    ) AS l
    WHERE "LemmaForm".id = l.id
  `;
  await client.$executeRaw`
    DELETE FROM "Lemma"
    USING (
    	SELECT "Lemma".id FROM "Lemma"
    	LEFT JOIN "LemmaForm" ON "LemmaForm"."lemmaId" = "Lemma".id
    	LEFT JOIN "LemmaResource" ON "LemmaResource"."lemmaId" = "Lemma".id
    	WHERE "LemmaForm".id IS NULL AND "LemmaResource".content IS NULL
    ) AS l
    WHERE "Lemma".id = l.id
  `;
}

async function run() {
  const client = new PrismaClient();

  console.log('inserting new lemmas...');
  await loadNewLemmas(client);
  console.log('inserting new lemma forms...');
  await loadNewLemmaForms(client);
  console.log('updating word lemma forms...');
  await loadWordLemmaChanges(client);
  console.log('removing unused lemmas and forms...');
  await removeUnusedLemmas(client);

  console.log('done');

  await client.$disconnect();
}

run().catch(console.error);
