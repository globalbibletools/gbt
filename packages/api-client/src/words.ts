import type { PatchWordGlossRequestBody } from '@translation/api-types';
import ApiClient from './client';

export { PatchWordGlossRequestBody };

export default class Verses {
  constructor(private readonly client: ApiClient) {}

  async updateGloss(
    wordId: string,
    language: string,
    gloss?: string
  ): Promise<void> {
    const body: PatchWordGlossRequestBody = {
      gloss,
    };
    await this.client.patch({
      path: `/api/languages/${language}/words/${wordId}`,
      body,
    });
  }
}
