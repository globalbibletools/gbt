import data from '../../../data/morphology';
import { PrismaClient } from '../prisma/client';

const client = new PrismaClient();

const STRONGS_REGEX = / \[e\]/;

async function run() {
  const bookNames = Object.keys(data);

  const wordData = [];
  const lemmas: {
    [strongs: string]: {
      [grammar: string]: { verseIds: string[]; formId?: string };
    };
  } = {};

  for (let bookIndex = 0; bookIndex < bookNames.length; bookIndex++) {
    const bookName = bookNames[bookIndex];
    const chapters = data[bookName];

    const book = await client.book.create({
      data: {
        id: bookIndex + 1,
        name: bookName,
      },
    });

    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const verses = chapters[chapterIndex];
      const chapterNumber = chapterIndex + 1;

      for (let verseIndex = 0; verseIndex < verses.length; verseIndex++) {
        const words = verses[verseIndex];
        const verseNumber = verseIndex + 1;

        const verseId = [
          book.id.toString().padStart(2, '0'),
          chapterNumber.toString().padStart(3, '0'),
          verseNumber.toString().padStart(3, '0'),
        ].join('');

        const verse = await client.verse.create({
          data: {
            id: verseId,
            number: verseNumber,
            chapter: chapterNumber,
            book: { connect: { id: book.id } },
          },
        });

        // Some entries in the words list are text in between words, so we ignore them.
        const filteredWords = words.filter((word) => word.length === 6);

        for (let wordIndex = 0; wordIndex < filteredWords.length; wordIndex++) {
          const [text, , , grammar, rawStrongs] = filteredWords[wordIndex];
          const order = wordIndex + 1;

          // We clean the strongs codes since the hebrew ones have some extra characters.
          // We also prefix the code with a language code based on the book.
          const strongs = `${book.id < 40 ? 'H' : 'G'}${rawStrongs.replace(
            STRONGS_REGEX,
            ''
          )}`;

          // We have to accumulate word data until we have inserted all of the lemma data.
          const wordId = `${verseId}${(order + 1).toString().padStart(2, '0')}`;
          wordData.push({
            id: wordId,
            text,
            verseId: verse.id,
            grammar,
            strongs,
          });

          lemmas[strongs] ??= {};
          lemmas[strongs][grammar] ??= { verseIds: [] };
          lemmas[strongs][grammar].verseIds.push(wordId);
        }
      }
    }
  }

  for (const [lemma, forms] of Object.entries(lemmas)) {
    try {
      await client.lemma.create({
        data: {
          id: lemma,
          forms: {
            createMany: {
              data: Object.keys(forms).map((grammar, i) => {
                const id = `${lemma}-${i + 1}`;
                lemmas[lemma][grammar].formId = id;
                return {
                  id,
                  grammar,
                };
              }),
            },
          },
        },
      });
    } catch (error) {
      console.log(
        lemma,
        Object.values(forms).map((form) => form.formId)
      );
      throw error;
    }
  }

  await client.word.createMany({
    data: wordData.map((word) => ({
      id: word.id,
      verseId: word.verseId,
      text: word.text,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      formId: lemmas[word.strongs][word.grammar].formId!,
    })),
  });

  await client.$disconnect();
}

run();
