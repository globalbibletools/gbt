# Database

Our database is postgresql@14.7 with prisma to manage the schema and migrations. Each package can have its own prisma schema if it has its own database. At this moment, only the api project has a database.

[Database schema](./../packages/db/src/schema.prisma)

## Setup

1. [Install](https://www.postgresql.org/download/) postgresql version 14 (latest version).
1. Create database for the project. You can perform this task using the included `pgAdmin` tool.
1. Create a .env.local file in the api and db projects for local environment variables
1. Set the `DATABASE_URL` env var in both files above to the postgres connection string. You may need to include a username and password in the connection string. Here is a template you can use:

```text
DATABASE_URL=postgres://{user}:{password}@{hostname}:{port}/{database-name}
```

1. In a terminal run: `nx prisma db migrate reset` to scaffold the database schema.
1. In a terminal run: `pg_restore -Fc --format=custom --dbname=<connection-string> data/seed.dump` to populate your database with development data. This includes all of the original language data as well as English glosses.

## Seed and Reset Data

In order to reset the database to the current schema and clear all data, run the following command. It may take a few minutes to remove any existing data and build out the database schema.

```bash
nx prisma db migrate reset
```

Then you can seed the database with static verse data. This will take a few minutes to run.

```bash
nx seed db
```

This seed script runs fine when the database is on the local machine, but for remote databases, it is quite slow. In these situations, use this command:

```bash
pg_restore -Fc --format=custom --dbname=<connection-string> data/seed.dump
```

Generate a new seed file from your local database with:

```bash
pg_dump -Fc --data-only --exclude-table _prisma_migrations <db-name> > data/seed.dump
```

## Migrations

To apply existing migrations to your local database, run the command:

```bash
nx prisma db migrate dev
```

To migrate the database schema, first update the prisma schema, and then run the command:

```bash
nx prisma db migrate dev --name migration_name
```

This will generate a SQL script to modify the database which will be automatically run in preview and production on release.
