import { PrismaExecutorSchema } from './schema';
import { execa } from 'execa';

export default async function runExecutor({
  _,
  schema,
  ...options
}: PrismaExecutorSchema) {
  // The options are for executors are parsed with yargs, so arguments without a `-` or `--` are added to the `_` property.
  // We assume these are all prisma commands like `prisma migrate reset`.
  // Then we add the schema argument and any remaining standard arguments.
  const mycommand = `npx prisma ${_.join(
    ' '
  )} --schema=${schema} ${Object.entries(options)
    .map(([key, value]) => `--${key}=${value}`)
    .join(' ')}`;

  // `inherit` allows the parent terminal to send and receive input and output on stdin/out/err.
  // This is necessary because prisma commands are interactive.
  // execSync(command, {
  //   stdio: 'inherit',
  // });

  console.info(`Executing mycommand: ${mycommand}`);
  console.info(`Current working directory: ${process.cwd()}`);

  await execa.command(mycommand, {
    cwd: process.cwd(),
    stdio: [process.stdin, process.stdout, 'pipe'],
  });

  return {
    success: true,
  };
}
