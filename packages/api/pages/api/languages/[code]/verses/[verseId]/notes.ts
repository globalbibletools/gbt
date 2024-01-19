import { GetVerseTranslatorNotesResponseBody } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { Prisma, client } from '../../../../../../shared/db';

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseTranslatorNotesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }
      const verse = await client.verse.findUnique({
        where: {
          id: req.query.verseId,
        },
        include: {
          words: {
            orderBy: {
              id: Prisma.SortOrder.asc,
            },
          },
        },
      });

      if (verse) {
        const response: GetVerseTranslatorNotesResponseBody = { data: {} };
        for (const word of verse.words) {
          const note = await client.translatorNote.findUnique({
            where: {
              wordId_languageId: {
                wordId: word.id,
                languageId: language.id,
              },
            },
            include: {
              author: true,
            },
          });
          if (note) {
            response.data[word.id] = {
              wordId: word.id,
              authorName: note.author.name ?? '',
              content: note.note,
              timestamp: note.timestamp,
            };
          }
        }
        res.ok(response);
      }
      res.notFound();
    },
  })
  .build();
