import { PrismaExecutorSchema } from './schema';
import { spawn } from 'child_process';

export default async function runExecutor({
  _,
  schema,
  ...options
}: PrismaExecutorSchema) {
  // The options are for executors are parsed with yargs, so arguments without a `-` or `--` are added to the `_` property.
  // We assume these are all prisma commands like `prisma migrate reset`.
  // Then we add the schema argument and any remaining standard arguments.

  // `inherit` allows the parent terminal to send and receive input and output on stdin/out/err.
  // This is necessary because prisma commands are interactive.
  const child = spawn(
    'npx',
    [
      'prisma',
      ..._,
      `--schema=${schema}`,
      ...Object.entries(options).map(([key, value]) => `--${key}=${value}`),
    ],
    {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
    }
  );

  // But we manually console.log stdout so that it flushes when waiting for stdin.
  child.stdout.on('data', (chunk) => console.log(chunk.toString()));

  await new Promise<void>((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });

  return {
    success: true,
  };
}
