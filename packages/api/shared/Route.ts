import { ErrorDetail } from '@translation/api-types';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ZodType } from 'zod';
import { Prisma, SystemRole } from '@translation/db';
import { cors } from './cors';
import * as Errors from './errors';
import { createPolicyFor, Policy } from './access-control/policy';
import { auth } from './auth';
import { client } from './db';
import { ForbiddenError } from '@casl/ability';
import { IncomingHttpHeaders } from 'http';

export interface SessionUser {
  id: string;
  systemRoles: SystemRole[];
}
export interface Session {
  id: string;
  user?: SessionUser;
}

export interface RouteRequest<Params, Body> {
  query: Params;
  body: Body;
  session?: Session;
  policy: Policy;
  headers: IncomingHttpHeaders;
}

export interface ResponseHelper<Body> {
  /** Set the user on the session. */
  login(userId: string): Promise<void>;
  /** Invalidate the session. */
  logout(): Promise<void>;
  /** Set a header on the response. */
  setHeader(header: string, value: string): void;
  /** Returns 200 or 204 dependening on whether there is a response body to send. */
  ok(data?: Body): void;
  /** Returns 201 created with the contents of the new resource. */
  created(location: string): void;
  /** Returns 302 with the location of the redirect. */
  redirect(location: string): void;
  /** Returns 401 with a list of errors. By default it will have a single error with code Unauthorized. */
  unauthorized(errors?: ErrorDetail[]): void;
  /** Returns 403 with a list of errors. By default it will have a single error with code Forbidden. */
  forbidden(errors?: ErrorDetail[]): void;
  /** Returns 404 with a list of errors. By default it will have a single error with code NotFound. */
  notFound(errors?: ErrorDetail[]): void;
  /** Returns 409 with a list of errors. */
  conflict(errors: ErrorDetail[]): void;
  /** Returns 422 with a list of errors. */
  invalid(errors: ErrorDetail[]): void;
  /** Returns 400 with a list of errors. */
  badRequest(errors: ErrorDetail[]): void;
}

export type RouteDefinition<Params, RequestBody, ResponseBody> = {
  /**
   * Determines whether the user is authorized to access the route.
   * If this function returns, the user is authorized to proceed.
   * When this is called, `req.body` will have been parsed and should match the `RequestBody` type.
   * @param req The nextjs request object with typed query and body.
   */
  authorize?(req: RouteRequest<Params, RequestBody>): Promise<void>;
  /**
   * Defines the implementation of the route.
   * When this is called, `req.body` will have been parsed and should match the `RequestBody` type.
   * @param req The nextjs request object with typed query and body.
   * @param res The response helper wrapper around the nextjs response object.
   */
  handler(
    req: RouteRequest<Params, RequestBody>,
    res: ResponseHelper<ResponseBody>
  ): Promise<void>;

  /**
   * The `zod` schema used to parse the request body.
   * This schema should produce an object that matches the `RequestType`.
   * If `RequestBody` is `void` then a schema is not required.
   *
   * Note that there are some schemas that typescript is unable to catch.
   * The most common examples are:
   * - Not adding optional properties to the schema.
   * This won't return an error, but when those fields are provided, they won't be operated on.
   * - Treating a property as required in the schema that is optional in the type.
   * This will result in 422 errors if the field isn't provided.
   * - Adding extra properties to the schema that aren't in the type.
   * This could lead to unexpected 422 errors as well.
   */
  schema?: ZodType<RequestBody>;
};

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
export default function createRoute<
  Params extends { [key: string]: string }
>(): RouteBuilder<Params> {
  const handlers: { [method: string]: NextApiHandler } = {};

  function createHandler<RequestBody, ResponseBody>(
    definition: RouteDefinition<Params, RequestBody, ResponseBody>
  ): NextApiHandler {
    return async (req, res) => {
      const authRequest = auth.handleRequest({ req, res });
      const sessionData = await authRequest.validate();

      const responseHelper: ResponseHelper<ResponseBody> = {
        async login(userId: string) {
          if (sessionData) {
            await auth.invalidateSession(sessionData.sessionId);
          }
          authRequest.setSession(await auth.createSession(userId));
        },
        async logout() {
          if (sessionData) {
            await auth.invalidateSession(sessionData.sessionId);
          }
          authRequest.setSession(null);
        },
        setHeader(header: string, value: string) {
          res.setHeader(header, value);
        },
        ok(body?: ResponseBody) {
          if (body) {
            res.status(200).json(body);
          } else {
            res.status(204).end();
          }
        },
        created(location: string) {
          res.setHeader('Location', location);
          res.status(201).end();
        },
        redirect(location: string) {
          res.setHeader('Location', location);
          res.status(302).end();
        },
        unauthorized(errors: ErrorDetail[] = [{ code: 'Unauthorized' }]) {
          res.status(401).json({ errors });
        },
        forbidden(errors: ErrorDetail[] = [{ code: 'Forbidden' }]) {
          res.status(403).json({ errors });
        },
        notFound(errors: ErrorDetail[] = [{ code: 'NotFound' }]) {
          res.status(404).json({ errors });
        },
        conflict(errors: ErrorDetail[]) {
          res.status(409).json({ errors });
        },
        invalid(errors: ErrorDetail[]) {
          res.status(422).json({ errors });
        },
        badRequest(errors: ErrorDetail[]) {
          res.status(400).json({ errors });
        },
      };

      try {
        let body: RequestBody;
        if (definition.schema) {
          const parseResult = definition.schema.safeParse(
            req.method === 'GET' ? req.query : req.body
          );
          if (parseResult.success) {
            body = parseResult.data;
          } else {
            throw new Errors.InvalidRequestShapeError();
          }
        } else {
          // We have to cast this because typescript can't determine that this request has no body.
          body = undefined as RequestBody;
        }

        // If the session is valid, load the user's auth information.
        let session: Session | undefined;
        if (sessionData) {
          session = { id: sessionData.sessionId };

          const userData = await client.authUser.findUnique({
            where: {
              id: sessionData.userId,
            },
            include: {
              systemRoles: true,
            },
          });

          if (userData) {
            session.user = {
              id: userData.id,
              systemRoles: userData.systemRoles.map(({ role }) => role),
            };
          }
        }

        const request: RouteRequest<Params, RequestBody> = {
          query: req.query as Params,
          body,
          session,
          policy: createPolicyFor(session?.user),
          headers: req.headers,
        };

        await definition.authorize?.(request);

        try {
          await definition.handler(request, responseHelper);
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
              case 'P2025':
                throw new Errors.NotFoundError();
              case 'P2002':
                throw new Errors.AlreadyExistsError();
            }
          } else if (error instanceof ForbiddenError) {
            throw new Errors.ForbiddenError();
          }
          throw error;
        }
      } catch (error) {
        if (error instanceof Errors.NotFoundError) {
          return responseHelper.notFound([error.toErrorDetail()]);
        } else if (error instanceof Errors.AlreadyExistsError) {
          return responseHelper.conflict([error.toErrorDetail()]);
        } else if (error instanceof Errors.InvalidRequestShapeError) {
          return responseHelper.invalid([error.toErrorDetail()]);
        } else if (error instanceof Errors.ForbiddenError) {
          return responseHelper.forbidden([error.toErrorDetail()]);
        }
        console.error(error);
        res.status(500).end();
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
      return async (req: NextApiRequest, res: NextApiResponse) => {
        await cors(req, res);

        const handler = handlers[req.method ?? ''];
        if (handler) {
          await handler(req, res);
        } else {
          res.status(405).json({
            errors: [{ code: 'MethodNotAllowed' }],
          });
        }
      };
    },
  };
}
