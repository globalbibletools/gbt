import { BookProgressResponseBody } from '@translation/api-types';
import ApiClient from './client';

export default class Books {
  constructor(private readonly client: ApiClient) {}

  findProgress(
    bookId: number,
    language: string
  ): Promise<BookProgressResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/books/${bookId}/progress`,
    });
  }
}
