import type { GetLanguageImportOptionsResponseBody } from '@translation/api-types';
import type ApiClient from './client';

export { GetLanguageImportOptionsResponseBody };

export default class Import {
  constructor(private readonly client: ApiClient) {}

  getLanguages(): Promise<GetLanguageImportOptionsResponseBody> {
    return this.client.get({
      path: '/api/import/languages',
    });
  }
}
