import './require-test-db.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/api');
const requireApi = createRequire(join(apiDir, 'package.json'));
const tsc = requireApi.resolve('typescript/bin/tsc');
const tempRoot = resolve(tmpdir());
const output = mkdtempSync(join(tempRoot, 'yinshua-api-itest-'));

function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, { cwd: apiDir, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Integration test command exited with ${result.status ?? result.signal}`);
}

try {
  run([tsc, '--outDir', output, '--incremental', 'false', '--declaration', 'false', '--sourceMap', 'false', '--esModuleInterop', 'true']);
  run(['--test', join(output, 'src', '**', '*.itest.js')], {
    ...process.env,
    NODE_PATH: [join(apiDir, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(process.platform === 'win32' ? ';' : ':'),
  });
} finally {
  if (!resolve(output).startsWith(`${tempRoot}${sep}`)) throw new Error('Refusing to remove a path outside the temporary directory');
  rmSync(output, { recursive: true, force: true });
}
