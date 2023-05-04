import type {
  GetVerseGlossesResponseBody,
  GetVerseResponseBody,
} from '@translation/api-types';
import ApiClient from './client';

export { GetVerseResponseBody };

export default class Verses {
  constructor(private readonly client: ApiClient) {}

  findById(verseId: string): Promise<GetVerseResponseBody> {
    return this.client.get({
      path: `/api/verses/${verseId}`,
    });
  }

  findVerseGlosses(
    verseId: string,
    language: string
  ): Promise<GetVerseGlossesResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/glosses`,
    });
  }
}
