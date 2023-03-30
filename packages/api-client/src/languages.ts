import type {
  GetLanguageResponseBody,
  GetLanguagesResponseBody,
  PatchLanguageRequestBody,
  PatchLanguageResponseBody,
  PostLanguageRequestBody,
  PostLanguageResponseBody,
} from '@translation/api-types';
import type ApiClient from './client';

export {
  GetLanguageResponseBody,
  GetLanguagesResponseBody,
  PatchLanguageRequestBody,
  PatchLanguageResponseBody,
  PostLanguageRequestBody,
  PostLanguageResponseBody,
};

export default class Languages {
  constructor(private readonly client: ApiClient) {}

  findAll(): Promise<GetLanguagesResponseBody> {
    return this.client.get({
      path: '/api/languages',
    });
  }

  create(language: PostLanguageRequestBody): Promise<PostLanguageResponseBody> {
    return this.client.post({
      path: '/api/languages',
      body: language,
    });
  }

  findByCode(code: string): Promise<GetLanguageResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}`,
    });
  }

  update(
    language: PatchLanguageRequestBody
  ): Promise<PatchLanguageResponseBody> {
    return this.client.patch({
      path: `/api/languages/${language.data.id}`,
      body: language,
    });
  }
}
