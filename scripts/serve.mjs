// Tiny static server for dist/. Usage: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

export function serve(port = PORT) {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    let file = normalize(join(DIST, path));
    if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
    try {
      const s = await stat(file);
      if (s.isDirectory()) { res.writeHead(301, { Location: path + '/' }); return res.end(); }
    } catch {
      file = join(DIST, '404.html');
      res.statusCode = 404;
    }
    try {
      const body = await readFile(file);
      res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
      res.end(body);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve().then(() => console.log(`serving dist/ at http://localhost:${PORT}`));
}
