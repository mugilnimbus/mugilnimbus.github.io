import { mkdir, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'assets'), { recursive: true });
for (const path of ['index.html', 'src', 'assets/mark.svg', 'assets/fonts', 'assets/voice']) await cp(resolve(root, path), resolve(output, path), { recursive: true });
console.log('Built static portfolio in dist/. Private documents and unused media excluded.');
