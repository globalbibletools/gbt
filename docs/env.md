# Environment Variables

## API

`DATABASE_URL` (required) - The connection string to the postgres database.

`EMAIL_SERVER` - The smtp connection string for sending emails. If not provided, emails will just be logged.

`EMAIL_FROM` (required) - The from email address for all outgoing emails from the server.

`ORIGIN_ALLOWLIST` - A comma separeted list of origins to match Origin headers for CORS as CSRF protection.

`ORIGIN` - The origin to use when generate URLs that point to the api server.

## Web

`API_URL` (required) - The URL to send API requests to.
