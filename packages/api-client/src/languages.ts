import {
  GetLanguageImportResponseBody,
  type GetLanguageMembersResponseBody,
  type GetLanguageResponseBody,
  type GetLanguagesResponseBody,
  type LanguageRole,
  type PatchLanguageMemberRequestBody,
  type PatchLanguageRequestBody,
  type PostLanguageImportRequestBody,
  type PostLanguageMemberRequestBody,
  type PostLanguageRequestBody,
} from '@translation/api-types';
import type ApiClient from './client';

export {
  GetLanguageResponseBody,
  GetLanguagesResponseBody,
  PatchLanguageRequestBody,
  PostLanguageRequestBody,
};

export default class Languages {
  constructor(private readonly client: ApiClient) {}

  findAll(): Promise<GetLanguagesResponseBody> {
    return this.client.get({
      path: '/api/languages',
    });
  }

  async create(language: PostLanguageRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/languages',
      body: language,
    });
  }

  async startImport(
    code: string,
    body: PostLanguageImportRequestBody
  ): Promise<{ jobId: string }> {
    const { location } = await this.client.post({
      path: `/api/languages/${code}/import`,
      body,
    });
    return {
      jobId: location?.split('/').at(-1) ?? 'unknown',
    };
  }

  getImportStatus(
    code: string,
    jobId: string
  ): Promise<GetLanguageImportResponseBody> {
    return this.client.get<GetLanguageImportResponseBody>({
      path: `/api/languages/${code}/import/${jobId}`,
    });
  }

  findByCode(code: string): Promise<GetLanguageResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}`,
    });
  }

  async update(
    code: string,
    language: PatchLanguageRequestBody
  ): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${code}`,
      body: language,
    });
  }

  findMembers(code: string): Promise<GetLanguageMembersResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}/members`,
    });
  }

  async inviteMember(
    code: string,
    request: PostLanguageMemberRequestBody
  ): Promise<void> {
    await this.client.post({
      path: `/api/languages/${code}/members`,
      body: request,
    });
  }

  async updateMember(
    code: string,
    userId: string,
    roles: LanguageRole[]
  ): Promise<void> {
    const body: PatchLanguageMemberRequestBody = {
      roles,
    };
    await this.client.patch({
      path: `/api/languages/${code}/members/${userId}`,
      body,
    });
  }

  async removeMember(code: string, userId: string): Promise<void> {
    await this.client.delete({
      path: `/api/languages/${code}/members/${userId}`,
    });
  }
}
