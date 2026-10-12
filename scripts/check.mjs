import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
for (const directory of ['src','scripts','tests']) {
  for (const file of await readdir(resolve(root,directory))) {
    if (!file.endsWith('.mjs')) continue;
    const result = spawnSync(process.execPath,['--check',resolve(root,directory,file)],{encoding:'utf8'});
    if(result.status!==0) {process.stderr.write(result.stderr);process.exit(1);}
  }
}
const html=await readFile(resolve(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
if(new Set(ids).size!==ids.length)throw new Error('Duplicate HTML IDs');
const { order } = await import('../src/hooks.mjs');
const routes=[...ids,...order,'intro'];
for(const match of html.matchAll(/href="#([^"]+)"/g))if(!routes.includes(match[1]))throw new Error(`Missing anchor ${match[1]}`);
if(html.includes('target="_blank"')&&!html.includes('rel="noopener noreferrer"'))throw new Error('Unsafe external link');
console.log('Module syntax, HTML IDs, and story anchors checked.');
