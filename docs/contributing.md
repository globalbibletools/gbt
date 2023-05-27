# Contributing

## Tech Stack

These are the major technologies we are using. Familiarity with most of these will make it easier to contribute.

**Languages:** typescript

**Build tools:** npm, nx

**Web client:** react, tailwind

**API server:** node, nextjs, prisma, postgresql

## Local Development

1. [Install](https://nodejs.org/en/download/) node 18 and npm 8. If you need to maintain multiple node versions for other projects, consider using [nvm](https://github.com/nvm-sh/nvm).

1. [Install](https://www.postgresql.org/download/) posgresql 14.7 and [set up a new database](./db.md) before running this project.

1. Run `npm install` to install all of the project's dependencies. Run `npm i -g nx` to make the `nx` command available in the terminal.

1. Set up your `.env.local` file in the `api` package. At minimum you need to set `DATABASE_URL` to a postgresql connection string to the database you created earlier.

1. Run `nx seed api` to populate your database with development data. This includes all of the original language data as well as English glosses.

1. Run `nx serve api` and `nx serve web` in separate terminals. This will make the api server available on port 4300 and the web server available on 4200.

## Development Environment

- In VSCode, the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions will help enforce consistent formatting and linting rules. You can set VSCode up to use prettier as the formatter when saving a file.

- When you commit, your code will be automatically linted and formatted. Please address issues this process flags.

- It may also be helpful to install [pgadmin](https://www.pgadmin.org/) to manage your local postgres databases.

## Your first contribution

- Familiarize yourself with the documentation and codebase so that you understand what the expectations are.

- Take a look at the [project](https://github.com/users/arrocke/projects/1) to get a sense of what things have been prioritized to be worked on.
