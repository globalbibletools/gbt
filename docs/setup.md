# Setup

## Node

Make sure you have node 18 and npm 8 or 9 either [installed](https://nodejs.org/en/download/) or available through [nvm](https://github.com/nvm-sh/nvm)

You may find it helpful to install `nx` globally since our build system makes heavy use of the `nx` command. You can do that by running `npm i -g nx`

Run `npm install` to install all of the project's dependencies.

## Postgresql

Make sure you have installed [posgresql 14.7](https://www.postgresql.org/download/) and [set up a new database](./db.md) before running this project.

## Development Commands

### Dev Servers

Run `nx serve api` and `nx serve web` to start the development servers.

API server: `http://localhost:4300`

Web server: `http://localhost:4200`

## Development Environment

In VSCode, the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) will help enforce our formatting and linting rules. You can set VSCode up to use prettier for format when saving a file.

When you commit, your code will be linted and formatted. Please address issues this step flags.

It may also be helpful to install [pgadmin](https://www.pgadmin.org/) to manage your local postgres databases.
