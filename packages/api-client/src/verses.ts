import type { GetVerseResponseBody } from '@translation/api-types';
import ApiClient from './client';

export { GetVerseResponseBody as GetVerseWordsResponseBody };

export default class Verses {
  constructor(private readonly client: ApiClient) {}

  findById(verseId: string): Promise<GetVerseResponseBody> {
    return this.client.get({
      path: `/api/verses/${verseId}`,
    });
  }
}
