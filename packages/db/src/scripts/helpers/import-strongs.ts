import { Lemma, LemmaResource, PrismaClient } from '@prisma/client';
import { parseStrongs } from './parse-strongs';

const client = new PrismaClient();

export const importStrongs = async (filename: string, keyPrefix: 'H' | 'G') => {
  const resourceCode = 'STRONGS' as const;
  console.log(`Importing ${resourceCode} definitions...`);
  const parsed = parseStrongs(filename, keyPrefix);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({ where: { resourceCode } });
  const lemmaData: Lemma[] = [];
  const resourceData: LemmaResource[] = [];
  Object.keys(parsed)
    .filter((lemmaId) => {
      if (typeof parsed[lemmaId] === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .forEach((lemmaId) => {
      lemmaData.push({ id: lemmaId });
      const content = parsed[lemmaId];
      resourceData.push({ lemmaId, resourceCode, content });
    });
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  await client.lemmaResource.createMany({ data: resourceData });
  console.log(`Successfully imported ${resourceCode} definitions`);
};
