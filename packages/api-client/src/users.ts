import type { InviteUserRequestBody } from '@translation/api-types';
import ApiClient from './client';

export default class Users {
  constructor(private readonly client: ApiClient) {}

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
}
