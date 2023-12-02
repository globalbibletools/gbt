import { bookKeys } from '../../../../data/book-keys';
import { morphologyData } from '../../../../data/morphology';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const STRONGS_REGEX = / \[e\]/;

async function run() {
  const wordData: {
    id: string;
    text: string;
    verseId: string;
    grammar: string;
    strongs: string;
    english: string;
  }[] = [];
  const lemmas: {
    [strongs: string]: {
      [grammar: string]: { verseIds: string[]; formId?: string };
    };
  } = {};

  for (let bookIndex = 0; bookIndex < bookKeys.length; bookIndex++) {
    const bookKey = bookKeys[bookIndex];
    const chapters = morphologyData[bookKey];

    const book = await client.book.create({
      data: {
        id: bookIndex + 1,
        name: bookKey,
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

        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
          const [text, , english, grammar = '', rawStrongs = '????'] =
            words[wordIndex];

          // We clean the strongs codes since the hebrew ones have some extra characters.
          // We also prefix the code with a language code based on the book.
          const strongs = `${book.id < 40 ? 'H' : 'G'}${rawStrongs
            .replace(STRONGS_REGEX, '')
            .padStart(4, '0')}`;

          // We have to accumulate word data until we have inserted all of the lemma data.
          const wordId = `${verseId}${(wordIndex + 1)
            .toString()
            .padStart(2, '0')}`;
          wordData.push({
            id: wordId,
            text: text.normalize('NFD'),
            verseId: verse.id,
            grammar,
            strongs,
            english,
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
                const id = `${lemma}-${(i + 1).toString().padStart(3, '0')}`;
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

  const language = await client.language.create({
    data: {
      code: 'eng',
      name: 'English',
    },
  });

  await client.gloss.createMany({
    data: wordData.map((word) => ({
      wordId: word.id,
      languageId: language.id,
      gloss: word.english,
    })),
  });

  await client.$disconnect();
}

run();
