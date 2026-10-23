import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'src/examples');
const output = join(root, 'src/sources.json');

const sources = {};
for (const file of readdirSync(directory).sort()) {
  if (!file.endsWith('.tsx')) continue;
  sources[file.replace(/\.tsx$/, '')] = readFileSync(
    join(directory, file),
    'utf8'
  );
}

writeFileSync(output, `${JSON.stringify(sources, null, 2)}\n`);
console.log(`${Object.keys(sources).length} example sources`);
