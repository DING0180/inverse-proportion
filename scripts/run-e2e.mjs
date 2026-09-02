import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const viteCli = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const playwrightCli = join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js');

const server = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: projectRoot,
  stdio: ['ignore', 'ignore', 'inherit'],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) throw new Error('Vite preview server exited before becoming ready.');
    try {
      const response = await fetch('http://127.0.0.1:4173/inverse-proportion/');
      if (response.ok) return;
    } catch {
      // The preview process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Vite preview server did not become ready.');
}

let exitCode = 1;
try {
  await waitForServer();
  const tests = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, PW_EXTERNAL_SERVER: '1' },
  });
  const [code] = await once(tests, 'exit');
  exitCode = code ?? 1;
} finally {
  if (server.exitCode === null) server.kill();
  await Promise.race([once(server, 'exit'), new Promise((resolve) => setTimeout(resolve, 2_000))]);
}

process.exitCode = exitCode;
