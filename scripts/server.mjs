import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const production = process.argv.includes('--dist');
const root = production ? resolve(workspace, 'dist') : workspace;
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

export function resolvePublicPath(urlPath, base = root) {
  let path;
  try { path = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  if (path.includes('\\') || path.includes('\0') || path.split('/').includes('..')) return null;
  if (path === '/') path = '/index.html';
  if (!/^\/(index\.html|src\/|assets\/)/.test(path)) return null;
  const file = resolve(base, '.' + path);
  return file.startsWith(base + sep) ? file : null;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const server = createServer(async (request, response) => {
    const file = resolvePublicPath(request.url || '/');
    if (!file || !['GET','HEAD'].includes(request.method)) { response.writeHead(404); response.end('Not found'); return; }
    try {
      if (!(await stat(file)).isFile()) throw new Error('Not a file');
      const content = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Content-Length': content.byteLength });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/${production ? ' (build)' : ''}`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
