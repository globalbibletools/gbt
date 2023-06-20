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
