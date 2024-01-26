import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { client } from '../../../../../../shared/db';
import {
  GetWordCommentsResponseBody,
  PostWordCommentRequestBody,
} from '@translation/api-types';

export default createRoute<{ code: string; wordId: string }>()
  .get<void, GetWordCommentsResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      const comments = await client.comment.findMany({
        where: {
          wordId: req.query.wordId,
          languageId: language.id,
        },
        include: {
          author: true,
        },
      });

      res.ok({
        data: comments.map((comment) => ({
          commentId: comment.id,
          authorName: comment.author.name ?? '',
          timestamp: +comment.timestamp,
          content: comment.content,
        })),
      });
    },
  })
  .post<PostWordCommentRequestBody, void>({
    schema: z.object({
      comment: z.string(),
    }),
    authorize: authorize((req) => ({
      action: 'translate',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      if (!language || !req.session || !req.session.user) {
        res.notFound();
        return;
      }

      await client.comment.create({
        data: {
          wordId: req.query.wordId,
          languageId: language.id,
          timestamp: new Date(),
          authorId: req.session.user.id,
          content: req.body.comment,
        },
      });

      res.ok();
    },
  })
  .build();
