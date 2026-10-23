import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = dirname(require.resolve('@thorvg/webcanvas'));
const pkg = JSON.parse(readFileSync(join(dist, '..', 'package.json'), 'utf8'));
const declarationPath = join(dist, 'webcanvas.d.ts');
const output = join(root, 'src/native/generated/constants.ts');

const program = ts.createProgram([declarationPath], { noEmit: true, skipLibCheck: true });
const checker = program.getTypeChecker();
const source = program.getSourceFile(declarationPath);

const enums = [];
source.forEachChild((node) => {
  if (!ts.isEnumDeclaration(node)) return;
  const members = node.members.map((member) => {
    const value = checker.getConstantValue(member);
    if (typeof value !== 'number') {
      throw new Error(`${node.name.text}.${member.name.getText(source)} is not a numeric constant`);
    }
    return [member.name.getText(source), value];
  });
  enums.push([node.name.text, members]);
});

if (enums.length === 0) {
  throw new Error(`No enums found in ${declarationPath}`);
}

const body = enums
  .map(([name, members]) => {
    const lines = members.map(([key, value]) => `  ${key} = ${value},`).join('\n');
    return `export enum ${name} {\n${lines}\n}\n`;
  })
  .join('\n');

const banner = `// Generated from @thorvg/webcanvas@${pkg.version} by scripts/generate-constants.mjs. Do not edit.\n\n`;
const version = `export const WEBCANVAS_VERSION = '${pkg.version}';\n\n`;

mkdirSync(dirname(output), { recursive: true });
const next = banner + version + body;
let previous = '';
try {
  previous = readFileSync(output, 'utf8');
} catch {}
if (previous !== next) {
  writeFileSync(output, next);
}
console.log(`${enums.length} enums from @thorvg/webcanvas@${pkg.version}`);
