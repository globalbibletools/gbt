import type {
  PatchWordGlossRequestBody,
  PatchWordTranslatorNoteRequestBody,
} from '@translation/api-types';
import ApiClient from './client';

export { PatchWordGlossRequestBody };

export default class Words {
  constructor(private readonly client: ApiClient) {}

  async updateGloss({
    wordId,
    language,
    ...body
  }: PatchWordGlossRequestBody & {
    wordId: string;
    language: string;
  }): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${language}/words/${wordId}`,
      body,
    });
  }

  async updateTranslatorNote({
    wordId,
    language,
    ...body
  }: PatchWordTranslatorNoteRequestBody & {
    wordId: string;
    language: string;
  }): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${language}/words/${wordId}/note`,
      body,
    });
  }
}
