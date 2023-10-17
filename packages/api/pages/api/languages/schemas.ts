import * as z from 'zod';
import { Language, TextDirection } from '@translation/api-types';

const schemaForType =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(arg: S) => {
    return arg;
  };

export const languageSchema = schemaForType<Language>()(
  z.object({
    code: z.string(),
    name: z.string(),
    font: z.string(),
    textDirection: z.enum(
      Object.values(TextDirection) as [TextDirection, ...TextDirection[]]
    ),
    bibleTranslationIds: z.array(z.string()),
  })
);
