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
1. [Install](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions) the SAM cli.
1. [Install](https://www.docker.com) docker.
1. Run `npm install` to install all of the project's dependencies. Run `npm i -g nx` to make the `nx` command available in the terminal.
1. Set up your `.env.local` file in the `api` package. At minimum you need to set `DATABASE_URL` to a postgresql connection string to the database you created earlier.
1. Run `nx seed api` to populate your database with development data. This includes all of the original language data as well as English glosses.
1. Run `nx serve api`, `nx serve-functions lambda-functions`, and `nx serve web` in separate terminals. This will make the api server available on port 4300, the lambda functions available on port 3000, and the web server available on 4200.

## Development Environment

- We use bash and zsh as our main terminal. Other terminals may work as well, but haven't been tested.
- In VSCode, the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions will help enforce consistent formatting and linting rules. You can set VSCode up to use prettier as the formatter when saving a file.
- When you commit, your code will be automatically linted and formatted. Please address issues this process flags.
- It may also be helpful to install [pgadmin](https://www.pgadmin.org/) to manage your local postgres databases.

## Your first contribution

- Familiarize yourself with the documentation and codebase so that you understand what the expectations are.
- Take a look at the [project](https://github.com/users/arrocke/projects/1) to get a sense of what things have been prioritized to be worked on.

## Pull Requests

- Please avoid putting too much into a single PR. Large PRs are more difficult to review and tend to create more merge conflicts.
- Follow the PR template to speed up the review process.
- PRs are squashed before they are merged, so your commit names within the PR can be whatever you'd like.
- Let the reviewer resolve comments in subsequent reviews as confirmation of changes completed as asked for.

## Dependencies

- Confirm that a third party package is necessary. In some cases, it may be preferrable to write our own code so that we can maintain it.
- Packages must be open source. Either permissive (MIT, Apache) or copy-left (GPL, LGPL).
- Packages must be reliable. Generally it's better for a package to be popular and maintained, but in some cases popular packages or younger packages with active development can be used.
  - The package is widely used: check the number of downloads on npmjs.com, use npm trends to check popularity over time.
  - The package is maintained: check contributions, stars, and releases on GitHub, or check the quality of documentation
- Prefer smaller packages or packages that can be tree shaken to remove the unused parts. This limits the bloat of our build.
