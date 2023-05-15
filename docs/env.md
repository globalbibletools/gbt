# Environment Variables

## API

`DATABASE_URL` (required) - The connection string to the postgres database.

`EMAIL_SERVER` (required) - The smtp connection string for sending emails.

`EMAIL_FROM` (required) - The from email address for all outgoing emails from the server.

`ORIGIN_MATCH` - The regex to use to match Origin headers for CORS.

`NEXTAUTH_SECRET` (required) - The key used to sign JWTs.

`NEXTAUTH_URL` - The base URL for authentication routes.

## Web

`API_URL` (required) - The URL to send API requests to.
