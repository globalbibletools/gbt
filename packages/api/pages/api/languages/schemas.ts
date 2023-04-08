import * as z from 'zod';
import { Language } from '@translation/api-types';

export const languageSchema = (id?: string): z.ZodType<Language> =>
  z.object({
    type: z.literal('language'),
    id: id ? z.literal(id) : z.string(),
    attributes: z.object({
      name: z.string(),
    }),
  });
