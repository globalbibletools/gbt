import { ErrorResponse } from '@translation/api-types';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export interface RequestData<Params, ResponseBody> {
  req: NextApiRequest & { query: Params };
  res: NextApiResponse<ResponseBody | ErrorResponse>;
}

export interface RouteDefinition<Params, ResponseBody> {
  handler(data: RequestData<Params, ResponseBody>): Promise<void>;
}

export interface RouteBuilder<Params> {
  build(): NextApiHandler;
  get<ResponseBody>(
    definition: RouteDefinition<Params, ResponseBody>
  ): RouteBuilder<Params>;
  patch<ResponseBody>(
    definition: RouteDefinition<Params, ResponseBody>
  ): RouteBuilder<Params>;
  post<ResponseBody>(
    definition: RouteDefinition<Params, ResponseBody>
  ): RouteBuilder<Params>;
}

export default function createRoute<Params>(): RouteBuilder<Params> {
  const handlers: { [method: string]: NextApiHandler } = {};

  function createHandler<ResponseBody>(
    definition: RouteDefinition<Params, ResponseBody>
  ): NextApiHandler {
    return async (req, res) => {
      await definition.handler({
        req: req as NextApiRequest & { query: Params },
        res,
      });
    };
  }

  return {
    get<ResponseBody>(definition: RouteDefinition<Params, ResponseBody>) {
      handlers['GET'] = createHandler(definition);
      return this;
    },
    post<ResponseBody>(definition: RouteDefinition<Params, ResponseBody>) {
      handlers['POST'] = createHandler(definition);
      return this;
    },
    patch<ResponseBody>(definition: RouteDefinition<Params, ResponseBody>) {
      handlers['PATCH'] = createHandler(definition);
      return this;
    },
    build() {
      return (req: NextApiRequest, res: NextApiResponse) => {
        const handler = handlers[req.method ?? ''];
        if (handler) {
          handler(req, res);
        } else {
          res.status(405).json({
            errors: [{ code: 'MethodNotAllowed' }],
          });
        }
      };
    },
  };
}
