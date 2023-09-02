import type {
  GetUsersResponseBody,
  PostEmailVerificationRequest,
  PostUserRequestBody,
  UpdateUserRequestBody,
} from '@translation/api-types';
import ApiClient from './client';

export default class Users {
  constructor(private readonly client: ApiClient) {}

  findAll(): Promise<GetUsersResponseBody> {
    return this.client.get({
      path: `/api/users`,
    });
  }

  async invite(body: PostUserRequestBody): Promise<void> {
    await this.client.post({
      path: `/api/users`,
      body,
    });
  }

  async update({
    id,
    ...body
  }: UpdateUserRequestBody & { id: string }): Promise<void> {
    await this.client.patch({
      path: `/api/users/${id}`,
      body,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const body: PostEmailVerificationRequest = { token };
    await this.client.post({
      path: `/api/email/verify`,
      body,
    });
  }
}
