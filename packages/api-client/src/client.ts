import type { ErrorResponse, GetSessionResponse } from '@translation/api-types';
import Languages from './languages';
import Users from './users';
import Verses from './verses';
import Words from './words';

export { ErrorResponse };
export * from './languages';
export * from './verses';
export * from './words';

export interface ApiClientOptions {
  baseUrl: string;
}

export interface ApiClientRequestOptions {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

export type ApiClientGetOptions = Pick<
  ApiClientRequestOptions,
  'path' | 'query'
>;
export type ApiClientPatchOptions = Pick<
  ApiClientRequestOptions,
  'path' | 'query' | 'body'
>;
export type ApiClientPostOptions = Pick<
  ApiClientRequestOptions,
  'path' | 'query' | 'body'
>;

export class ApiClientError extends Error {
  readonly status: number;

  constructor(
    readonly request: Request,
    readonly response: Response,
    readonly body: ErrorResponse
  ) {
    super(
      `${response.statusText} (${response.status}) on ${request.method} request to ${request.url}`
    );

    this.name = 'ApiClientError';
    this.status = response.status;

    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export default class ApiClient {
  readonly languages: Languages;
  readonly verses: Verses;
  readonly words: Words;
  readonly users: Users;

  constructor(private options: ApiClientOptions = { baseUrl: '' }) {
    this.languages = new Languages(this);
    this.verses = new Verses(this);
    this.words = new Words(this);
    this.users = new Users(this);
  }

  async request({ path, query, body, method }: ApiClientRequestOptions) {
    const url = `${this.options.baseUrl}${path}${
      query ? `?${new URLSearchParams(query).toString()}` : ''
    }`;

    const headers = new Headers();

    let formattedBody;
    if (body) {
      headers.set('Content-Type', 'application/json');
      formattedBody = JSON.stringify(body, null, 2);
    }

    const request = new Request(url, {
      method,
      credentials: 'include',
      mode: 'cors',
      headers,
      body: formattedBody,
    });
    const response = await fetch(request);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      responseBody = {};
    }
    if (response.ok) {
      return responseBody;
    } else {
      throw new ApiClientError(request, response, responseBody);
    }
  }

  async get<Response>(request: ApiClientGetOptions): Promise<Response> {
    return await this.request({ ...request, method: 'GET' });
  }

  async post<Response>(request: ApiClientPostOptions): Promise<Response> {
    return await this.request({ ...request, method: 'POST' });
  }

  async patch<Response>(request: ApiClientPatchOptions): Promise<Response> {
    return await this.request({ ...request, method: 'PATCH' });
  }

  getSession(): Promise<GetSessionResponse> {
    return this.get({
      path: '/api/auth/session',
    });
  }
}
