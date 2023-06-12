import type {
  GetUsersResponseBody,
  InviteUserRequestBody,
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

  invite(body: InviteUserRequestBody): Promise<void> {
    return this.client.post({
      path: `/api/users`,
      body,
    });
  }

  async sendInvite(request: {
    email: string;
    callbackUrl: string;
    json?: string;
  }): Promise<void> {
    const { csrfToken } = await this.client.get<{ csrfToken: string }>({
      path: '/api/auth/csrf',
    });
    const body = { ...request, csrfToken };
    return this.client.post({
      path: '/api/auth/signin/email',
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
}
