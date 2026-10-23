#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

function resolveWebCanvas() {
  for (const base of [join(process.cwd(), 'package.json'), import.meta.url]) {
    try {
      return dirname(createRequire(base).resolve('@thorvg/webcanvas'));
    } catch {}
  }
  throw new Error('Could not resolve @thorvg/webcanvas. Install @thorvg/react-native-thorvg first.');
}

const target = resolve(process.cwd(), process.argv[2] ?? 'public');
const dist = resolveWebCanvas();
const wasm = join(dist, 'thorvg.wasm');

if (!existsSync(wasm)) {
  throw new Error(`thorvg.wasm not found in ${dist}`);
}

mkdirSync(target, { recursive: true });
copyFileSync(wasm, join(target, 'thorvg.wasm'));

console.log(`Copied thorvg.wasm to ${target}`);
console.log("Load it with init({ locateFile: (path) => '/' + path.split('/').pop() })");
