# API Routes

We conform to [JSON:API](https://jsonapi.org/) spec for structuring our API routes.

You can view the OpenAPI explorer at http://localhost:4300/explorer or https://gloss-translation-api.vercel.app/explorer.

## Defining routes

Routes are defined as [nextjs API routes](https://nextjs.org/docs/api-routes/introduction). We've built a wrapper to make routes easier to build and more typesafe.

Here are a couple things to keep in mind when building a route.

1. Define `RequestBody` and `ResponseBody` types in the `api-types` package. These types are used to coordinate the contract between the api and clients. If the data that the api provides changes, the frontend type checker will catch that if we don't refactor the client as well.
2. Use the `createRoute` helper and define the `Params` type parameter with the dynamic route params from the nextjs route handler file name. This will type `req.query` to include url path parameters.
3. Use `get`, `post`, `patch`, and/or `delete` with the `RequestBody` and `ResponseBody` type parameters to define handlers for each method. Any methods that you don't define will return `405 Unspported Method` by default.
4. If the request has a body, then define a `zod` schema to match the `RequestBody` type. This will ensure that when the `handler` is called the body data is typed to the `RequestBody` type. This schema should not have buisness logic in it, it should just validate against the `RequestBody` type. Schema violations will return `409 Conflict` or `422 Unprocessable Content` depending on the issue.
5. Implement the api route in the `handler` function and use the `res` argument to return the appropriate response.
6. In most cases, you do not need to handle errors from `prisma`. The route handler will return the appropriate errors for you.
7. Throw errors that extend the `BaseError` class rather than returning responses directly. This simplifies generating the correct HTTP response for errors.
8. Add a method to the `api-client` package to type the request and response for the client.
