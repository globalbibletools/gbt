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

  invite(body: PostUserRequestBody): Promise<void> {
    return this.client.post({
      path: `/api/users`,
      body,
    });
  }

  update({
    id,
    ...body
  }: UpdateUserRequestBody & { id: string }): Promise<void> {
    return this.client.patch({
      path: `/api/users/${id}`,
      body,
    });
  }

  verifyEmail(token: string): Promise<void> {
    const body: PostEmailVerificationRequest = { token };
    return this.client.post({
      path: `/api/email/verify`,
      body,
    });
  }
}
