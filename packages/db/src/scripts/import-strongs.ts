import {
  Lemma,
  LemmaResource,
  PrismaClient,
  ResourceCode,
} from '@prisma/client';
import { greekStrongsData, hebrewStrongsData } from '../../../../data/strongs';

const client = new PrismaClient();

const importStrongs = async () => {
  await client.lemmaResource.deleteMany({
    where: { resourceCode: ResourceCode.STRONGS },
  });
  console.log('Importing hebrew strongs definitions...');
  await importStrongsData(hebrewStrongsData);
  console.log('Successfully imported hebrew strongs definitions');
  console.log('Importing greek strongs definitions...');
  await importStrongsData(greekStrongsData);
  console.log('Successfully imported greek strongs definitions');
};

const importStrongsData = async (
  data: Record<string, Record<string, string>>
) => {
  const lemmaData: Lemma[] = [];
  const resourceData: LemmaResource[] = [];
  Object.keys(data)
    .filter((lemmaId) => {
      const definition = data[lemmaId]['strongs_def'];
      if (typeof definition === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .forEach((lemmaId) => {
      const normalizedId = `${lemmaId[0]}${lemmaId
        .substring(1)
        .padStart(4, '0')}`;
      lemmaData.push({ id: normalizedId });
      const content = data[lemmaId]['strongs_def'];
      resourceData.push({
        lemmaId: normalizedId,
        resourceCode: ResourceCode.STRONGS,
        content,
      });
    });
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  await client.lemmaResource.createMany({ data: resourceData });
  console.log(`Imported ${resourceData.length} strongs definitions`);
};

importStrongs();
