import { Error } from '@translation/api-types';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ZodSchema } from 'zod';
import { Prisma } from './prisma/client';

export interface ResponseHelper<Body> {
  ok(data: Body): void;
  created(data: Body): void;
  notFound(errors?: Error[]): void;
  conflict(errors: Error[]): void;
  invalid(errors: Error[]): void;
}

export type RouteDefinition<Params, RequestBody, ResponseBody> = {
  handler(
    req: Omit<NextApiRequest, 'query' | 'body'> & {
      query: Params;
      body: RequestBody;
    },
    res: ResponseHelper<ResponseBody>
  ): Promise<void>;
} & (RequestBody extends void
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : {
      schema:
        | ZodSchema<RequestBody>
        | ((req: NextApiRequest & { query: Params }) => ZodSchema<RequestBody>);
    });

export interface RouteBuilder<Params> {
  build(): NextApiHandler;
  get<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
  patch<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
  post<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
}

export default function createRoute<Params>(): RouteBuilder<Params> {
  const handlers: { [method: string]: NextApiHandler } = {};

  function createHandler<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): NextApiHandler {
    return async (req, res) => {
      const responseHelper: ResponseHelper<ResponseBody> = {
        ok(body?: ResponseBody) {
          if (body) {
            res.status(200).json(body);
          } else {
            res.status(204);
          }
        },
        created(body: ResponseBody) {
          res.status(201).json(body);
        },
        notFound(errors: Error[] = [{ code: 'NotFound' }]) {
          res.status(404).json({ errors });
        },
        conflict(errors: Error[]) {
          res.status(409).json({ errors });
        },
        invalid(errors: Error[]) {
          res.status(422).json({ errors });
        },
      };

      if ('schema' in definition) {
        const schema =
          typeof definition.schema === 'function'
            ? definition.schema(req as any)
            : definition.schema;
        const parseResult = schema.safeParse(req.body);
        if (parseResult.success) {
          req.body = parseResult.data;
        } else {
          const paths = parseResult.error.issues.map((issue) =>
            issue.path.join('.')
          );

          // We return 422 for most validation issues.
          // In the future we may provide more helpful error messages.
          const hasManyIssues = paths.some(
            (path) => !['data.type', 'data.id'].includes(path)
          );
          if (hasManyIssues) {
            return responseHelper.invalid([{ code: 'InvalidRequestShape' }]);
          }

          // We return 409 if the body is valid, with the exeception of either the type and id.
          const typeMismatch = paths.find((path) => 'data.type' === path);
          const idMismatch = paths.find((path) => 'data.id' === path);
          const errors: Error[] = [];
          if (typeMismatch) {
            errors.push({ code: 'TypeMismatch' });
          }
          if (idMismatch) {
            errors.push({ code: 'IdMismatch' });
          }
          return responseHelper.invalid(errors);
        }
      } else {
        req.body = {};
      }

      try {
        await definition.handler(
          req as NextApiRequest & { query: Params; body: RequestBody },
          responseHelper
        );
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2025':
              return responseHelper.notFound();
            case 'P2002':
              return responseHelper.conflict([{ code: 'AlreadyExists' }]);
          }
        }
        console.error(error);
        res.status(500);
      }
    };
  }

  return {
    get<RequestBody, ResponseBody>(
      definition: RouteDefinition<Params, RequestBody, ResponseBody>
    ) {
      handlers['GET'] = createHandler(definition);
      return this;
    },
    post<RequestBody, ResponseBody>(
      definition: RouteDefinition<Params, RequestBody, ResponseBody>
    ) {
      handlers['POST'] = createHandler(definition);
      return this;
    },
    patch<RequestBody, ResponseBody>(
      definition: RouteDefinition<Params, RequestBody, ResponseBody>
    ) {
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
