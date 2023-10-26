import { parseLexicon } from './helpers/parse-lexicon';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const importBdb = async () => {
  const parsed = await parseLexicon('data/lexicon/hebrew.txt', ['BdbMedDef']);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({
    where: {
      resourceCode: 'BDB',
    },
  });
  const lemmaUpserts: any[] = [];
  const data = Object.keys(parsed)
    .filter((lemmaId) => {
      if (typeof parsed[lemmaId]['BdbMedDef'] === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .map((lemmaId) => {
      // We have to create non-existent lemmas, so that the foreign key on lemma
      // resources has something to point to.
      lemmaUpserts.push(
        client.lemma.upsert({
          create: {
            id: lemmaId,
          },
          update: {},
          where: {
            id: lemmaId,
          },
        })
      );
      return {
        lemmaId,
        resourceCode: 'BDB' as const,
        content: parsed[lemmaId]['BdbMedDef'],
      };
    });
  await client.$transaction(lemmaUpserts);
  await client.lemmaResource.createMany({ data });
};

console.log('Import BDB definitions...');
importBdb();
