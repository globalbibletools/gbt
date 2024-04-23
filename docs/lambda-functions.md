# Lambda Functions

We use an AWS lambda function to import data from hebrewgreekbible.online to the Global Bible Tools database. This document describes how to test that functionality in your local environment.

## Setup

1. [Install](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html#install-sam-cli-instructions) the SAM CLI.
1. [Install](https://www.docker.com) docker.
1. Copy `env-example.json` to `env.json` to the `lambda-functions` project and update with your local env vars. You can use `host.docker.internal` in situations where the host IP address (AKA `localhost`) is needed. This allows the docker container to connect to services on your host machine.

## Import Language

1. Make sure docker is running on your machine.
2. Comment out the `await sqsClient.send` call in `packages/api/pages/api/languages/[code]/import.ts`
   - This will allow you to test the lambda function locally without SQS.
3. Use the web app to start the import process
   1. Go to the import page for a language (example: `http://localhost:4200/admin/languages/spa/import`).
   2. Select the language to import from hebrewgreekbible.online.
   3. Click "Import Glosses".
   4. Submit the confirmation dialog.
4. Update `packages/lambda-functions/event.json`
   1. Set `languageCode` to the language code in your local environment
   2. Set `importLanguage` to the name of the language on hebrewgreekbible.online
5. Run `nx serve lambda-functions` to trigger the import language lambda function.
   - The `Failed to parse source map` error is normal and can be safely ignored.
   - You have to restart this every time you make lambda function code changes. Hot reload isn't trivial when running local lambda functions - see [here](https://github.com/aws/aws-sam-cli/issues/901) and [here](https://github.com/aws/aws-sam-cli/issues/921).
