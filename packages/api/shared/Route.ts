import { Error } from '@translation/api-types';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ZodSchema } from 'zod';
import { Prisma } from '../prisma/client';

export interface ResponseHelper<Body> {
  /** Returns 200 or 204 dependening on whether there is a response body to send. */
  ok(data?: Body): void;
  /** Returns 201 created with the contents of the new resource. */
  created(data: Body): void;
  /** Returns 404 with a list of errors. By default it will have a single error with code NotFound. */
  notFound(errors?: Error[]): void;
  /** Returns 409 with a list of errors. */
  conflict(errors: Error[]): void;
  /** Returns 422 with a list of errors. */
  invalid(errors: Error[]): void;
}

export type RouteDefinition<Params, RequestBody, ResponseBody> = {
  /**
   * Defines the implementation of the route.
   * When this is called, `req.body` will have been parsed and should match the `RequestBody` type.
   * @param req The nextjs request object with typed query and body.
   * @param res The response helper wrapper around the nextjs response object.
   */
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
      /**
       * The `zod` schema used to parse the request body.
       * This schema should produce an object that matches the `RequestType`.
       * If `RequestBody` is `void` then a schema is not required.
       */
      schema:
        | ZodSchema<RequestBody>
        | ((req: NextApiRequest & { query: Params }) => ZodSchema<RequestBody>);
    });

export interface RouteBuilder<Params> {
  /**
   * Creates a nextjs API route handler.
   * This will compile the handlers for each method into a single handler.
   * It also handles 405 responses for unsupported methods.
   */
  build(): NextApiHandler;
  /**
   * Creates a GET route handler
   * @template RequestBody The type of the HTTP request body. This should be validated by the `schema`.
   * @template ResponseBody The type of the HTTP response body. This route should return a value that matches this type.
   */
  get<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
  /**
   * Creates a PATCH route handler
   * @template RequestBody The type of the HTTP request body. This should be validated by the `schema`.
   * @template ResponseBody The type of the HTTP response body. This route should return a value that matches this type.
   */
  patch<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
  /**
   * Creates a POST route handler
   * @template RequestBody The type of the HTTP request body. This should be validated by the `schema`.
   * @template ResponseBody The type of the HTTP response body. This route should return a value that matches this type.
   */
  post<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
  /**
   * Creates a DELETE route handler
   * @template RequestBody The type of the HTTP request body. This should be validated by the `schema`.
   * @template ResponseBody The type of the HTTP response body. This route should return a value that matches this type.
   */
  delete<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): RouteBuilder<Params>;
}

/**
 * Creates a route handler for a nextjs API route.
 * The result of `build()` is exported and consumed by nextjs.
 * @template Params The type of the URL parameters as defined in the nextjs file names.
 */
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
    delete<RequestBody, ResponseBody>(
      definition: RouteDefinition<Params, RequestBody, ResponseBody>
    ) {
      handlers['DELETE'] = createHandler(definition);
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
