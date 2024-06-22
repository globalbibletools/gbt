import type {
  PatchPhraseFootnoteRequestBody,
  PatchPhraseGlossRequestBody,
  PatchPhraseTranslatorNoteRequestBody,
  PostPhraseRequestBody,
} from '@translation/api-types';
import ApiClient from './client';

export default class Phrases {
  constructor(private readonly client: ApiClient) {}

  async create({
    language,
    ...body
  }: PostPhraseRequestBody & { language: string }): Promise<string> {
    const { location } = await this.client.post({
      path: `/api/languages/${language}/phrases`,
      body,
    });
    return location?.split('/').at(-1) ?? '';
  }

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
