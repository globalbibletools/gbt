import type { ErrorResponse } from '@translation/api-types';
import Auth from './auth';
import Import from './import';
import Languages from './languages';
import Users from './users';
import Verses from './verses';
import Phrases from './phrases';

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
  readonly import: Import;
  readonly verses: Verses;
  readonly phrases: Phrases;
  readonly users: Users;
  readonly auth: Auth;

  constructor(private options: ApiClientOptions = { baseUrl: '' }) {
    this.languages = new Languages(this);
    this.import = new Import(this);
    this.verses = new Verses(this);
    this.phrases = new Phrases(this);
    this.users = new Users(this);
    this.auth = new Auth(this);
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
      return { body: responseBody, headers: response.headers };
    } else {
      throw new ApiClientError(request, response, responseBody);
    }
  }

  async get<Response>(request: ApiClientGetOptions): Promise<Response> {
    const response = await this.request({ ...request, method: 'GET' });
    return response.body;
  }

  async post<Response extends { location?: string }>(
    request: ApiClientPostOptions
  ): Promise<Response> {
    const response = await this.request({ ...request, method: 'POST' });
    return {
      ...response.body,
      location: response.headers.get('Location'),
    };
  }

  async patch<Response>(request: ApiClientPatchOptions): Promise<Response> {
    const response = await this.request({ ...request, method: 'PATCH' });
    return response.body;
  }

  async delete<Response>(request: ApiClientPatchOptions): Promise<Response> {
    const response = await this.request({ ...request, method: 'DELETE' });
    return response.body;
  }
}
