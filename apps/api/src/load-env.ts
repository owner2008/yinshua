import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = [resolve(process.cwd(), '.env'), resolve(process.cwd(), 'apps/api/.env')].find((path) =>
  existsSync(path),
);

if (envPath) {
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = unwrap(rawValue);
  }
}

function unwrap(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
