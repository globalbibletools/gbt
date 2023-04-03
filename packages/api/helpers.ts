import { ErrorResponse } from '@translation/api-types';
import { NextApiRequest, NextApiResponse } from 'next';

export type ApiRequest<Params = void> = Params extends void
  ? NextApiRequest
  : NextApiRequest & { query: Params };

export type ApiResponse<Body = void> = NextApiResponse<Body | ErrorResponse>;
