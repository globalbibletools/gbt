import type {
  GetInviteResponseBody,
  GetSessionResponse,
  PostInviteRequestBody,
  PostLoginRequest,
  PostForgotPasswordRequestBody,
  PostResetPasswordRequestBody,
} from '@translation/api-types';
import ApiClient from './client';

export default class Auth {
  constructor(private readonly client: ApiClient) {}

  session(): Promise<GetSessionResponse> {
    return this.client.get({
      path: '/api/auth/session',
    });
  }

  async login({ email, password }: PostLoginRequest): Promise<void> {
    await this.client.post({
      path: '/api/auth/login',
      body: { email, password },
    });
  }

  async logout(): Promise<void> {
    await this.client.post({
      path: '/api/auth/logout',
    });
  }

  getInvite(token: string): Promise<GetInviteResponseBody> {
    return this.client.get({
      path: '/api/auth/invite',
      query: { token },
    });
  }

  async acceptInvite({
    token,
    name,
    password,
  }: PostInviteRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/auth/invite',
      body: { token, name, password },
    });
  }

  async forgotPassword({
    email,
  }: PostForgotPasswordRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/auth/forgot-password',
      body: { email },
    });
  }

  async resetPassword({
    token,
    email,
    password,
  }: PostResetPasswordRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/auth/forgot-password',
      body: { email },
    });
  }
}
