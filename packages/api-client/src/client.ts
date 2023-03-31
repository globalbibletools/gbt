import Languages from './languages';

export * from './languages';

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
    readonly body: unknown
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

  constructor(private options: ApiClientOptions = { baseUrl: '' }) {
    this.languages = new Languages(this);
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
      credentials: 'same-origin',
      mode: 'cors',
      headers,
      body: formattedBody,
    });
    const response = await fetch(request);
    const responseBody = await response.json();
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
}