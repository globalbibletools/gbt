import * as z from 'zod';
import { Language } from '@translation/api-types';

const schemaForType =
  <T>() =>
  <S extends z.ZodType<T, any, any>>(arg: S) => {
    return arg;
  };

export const languageSchema = schemaForType<Language>()(
  z.object({
    code: z.string(),
    name: z.string(),
  })
);
