const execa = require('execa');

export default async function buildExecutor(options: {
  command: string;
  cwd?: string;
}) {
  console.info(`Executing workspace:run-command: ${options.command}...`);
  console.info(`Current working directory: ${process.cwd()}`);

  await execa.command(`${options.command} --schema=${options.schema}`, {
    cwd: options.cwd,
    stdio: [process.stdin, process.stdout, 'pipe'],
  });

  console.info(`✅ Executing workspace:run-command finished!`);

  return { success: true };
}
