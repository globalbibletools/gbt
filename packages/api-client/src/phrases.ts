import type {
  PatchPhraseFootnoteRequestBody,
  PatchPhraseGlossRequestBody,
  PatchPhraseTranslatorNoteRequestBody,
} from '@translation/api-types';
import ApiClient from './client';

export default class Phrases {
  constructor(private readonly client: ApiClient) {}

  async updateGloss({
    phraseId,
    language,
    ...body
  }: PatchPhraseGlossRequestBody & {
    phraseId: number;
    language: string;
  }): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${language}/phrases/${phraseId}/gloss`,
      body,
    });
  }

  async updateTranslatorNote({
    phraseId,
    language,
    ...body
  }: PatchPhraseTranslatorNoteRequestBody & {
    phraseId: number;
    language: string;
  }): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${language}/phrases/${phraseId}/translator-note`,
      body,
    });
  }

  async updateFootnote({
    phraseId,
    language,
    ...body
  }: PatchPhraseFootnoteRequestBody & {
    phraseId: number;
    language: string;
  }): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${language}/phrases/${phraseId}/footnote`,
      body,
    });
  }
}
