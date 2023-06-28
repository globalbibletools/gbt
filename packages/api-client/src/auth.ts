import type {
  GetSessionResponse,
  PostLoginRequest,
} from '@translation/api-types';
import ApiClient from './client';

export default class Auth {
  constructor(private readonly client: ApiClient) {}

  session(): Promise<GetSessionResponse> {
    return this.client.get({
      path: '/api/auth/session',
    });
  }

  login({ email, redirectUrl }: PostLoginRequest): Promise<void> {
    return this.client.post({
      path: '/api/auth/login',
      body: { email, redirectUrl },
    });
  }

  logout(): Promise<void> {
    return this.client.post({
      path: '/api/auth/logout',
    });
  }
}
