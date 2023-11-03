# Contributing

## Tech Stack

These are the major technologies we are using. Familiarity with most of these will make it easier to contribute.

**Languages:** typescript

**Build tools:** npm, nx

**Web client:** react, tailwind

**API server:** node, nextjs, prisma, postgresql

## Local Development

1. [Install](https://nodejs.org/en/download/) `Node.js 18` (this includes `npm`). If you need to maintain multiple node versions for other projects, consider using [nvm](https://github.com/nvm-sh/nvm).
1. In a terminal run: `npm install` to install all of the project's dependencies.
1. In a terminal run: `npm i -g nx` to make the `nx` command available in a terminal.
1. [Install and set up a new database](./db.md) and then return to this document.
1. In separate terminals run commands: `nx serve api` and `nx serve web`. This will make the api server available on port [4300](http://localhost:4300/explorer) and the web server available on [4200](http://localhost:4200).
1. To login as `ADMIN`, user and password should be `devyn61@ethereal.email` and `asdf1234`.

## Setting up a Virtual Development Environment

As an alternative to the above procedure, you have the option to set up an [Ubuntu virtual development environment](./vagrant.md).

## Lambda Functions

**Optional** - We only use lambda functions for the gloss import logic. You only need to set up your local environment to run these if you are working on that code.

1. [Install](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions) the SAM cli.
1. [Install](https://www.docker.com) docker.
1. Copy `env-example.json` to `env.json` to the lambda-functions project and update with your local env vars. You can use `host.docker.internal` in situations where the host IP address (AKA `localhost`) is needed. This allows the docker container to connect to services on your host machine.
1. Run `nx serve lambda-functions` in a terminal to make the lambda functions available on port 3000.
   - **Note** - you have to restart this every time you make code changes. Hot reload isn't trivial when running local lambda functions - see [here](https://github.com/aws/aws-sam-cli/issues/901) and [here](https://github.com/aws/aws-sam-cli/issues/921).

## Development Environment

- We use bash and zsh as our main terminal. Other terminals may work as well, but haven't been tested.
- In VSCode, the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions will help enforce consistent formatting and linting rules. You can set VSCode up to use prettier as the formatter when saving a file.
- When you commit, your code will be automatically linted and formatted. Please address issues this process flags.
- It may also be helpful to install [pgadmin](https://www.pgadmin.org/) to manage your local postgres databases.

## Your first contribution

- Familiarize yourself with the documentation and codebase so that you understand what the expectations are.
- Take a look at the [project](https://github.com/users/arrocke/projects/1) to get a sense of what things have been prioritized to be worked on.
- If you have never contributed to an open source repository before, you may find this [tutorial](https://github.com/workdone0/first-contribution-github) helpful.

## Pull Requests

- Use [conventional commit as your PR name](https://www.conventionalcommits.org/en/v1.0.0/). The most common prefixes we use are `feat:`, `refactor:`, `chore:`, and `docs:`.
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
- Lock the version down in package.json to a specific minor and patch version. This ensures that everyone is using the same version of dependencies.
