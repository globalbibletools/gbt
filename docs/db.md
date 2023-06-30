# Database

Our database is postgresql@14.7 with prisma to manage the schema and migrations. Each package can have its own prisma schema if it has its own database. At this moment, only the api project has a database.

[Database schema](./../packages/api/prisma/schema.prisma)

## Setup

1. Install postgresql version 14.7
1. Create database for the project
1. Set the `DATABASE_URL` env var in `packages/api/.env.local` to the postgres connection string. You may need to include a username and password in the connection string.
1. Run `nx prisma api migrate reset` to scaffold the database schema.
1. Run `nx seed api` to insert static verse data into the database.

## Seed and Reset Data

In order to reset the database to the current schema and clear all data, run the following command. It may take a few minutes to remove any existing data and build out the database schema.

```
nx prisma api migrate reset
```

Then you can seed the database with static verse data. This will take a few minutes to run.

```
nx seed api
```

This seed script runs fine when the database is on the local machine, but for remote databases, it is quite slow. In these situations, use this command:

```
pg_restore -Fc --format=custom --dbname=<connection-string> data/seed.dump
```

Generate a new seed file from your local database with:

```
pg_dump -Fc --data-only --exclude-table _prisma_migrations <db-name> > data/seed.dump
```

## Migrations

To migrate the database schema, first update the prisma schema, and then run the command:

```
nx prisma api migrate --name migration_name
```

This will generate a SQL script to modify the database which will be automatically run in preview and production on release.
