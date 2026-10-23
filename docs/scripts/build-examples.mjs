import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../site.mjs';

const docs = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(docs, 'static/examples');
const example = join(docs, '../example');

rmSync(output, { recursive: true, force: true });

execFileSync(
  'yarn',
  ['expo', 'export', '--platform', 'web', '--output-dir', output],
  {
    cwd: example,
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: '1',
      EXAMPLES_BASE_URL: `${site.baseUrl}examples`,
    },
  }
);
