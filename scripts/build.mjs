// Build the static site into dist/.
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/site.js';
import { render as renderHome } from '../src/pages/home.js';
import { POSTS, renderIndex, renderPost } from '../src/pages/blog.js';
import { renderPrivacy, renderTerms } from '../src/pages/legal.js';
import { render as renderNotFound } from '../src/pages/notfound.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function write(path, html) {
  const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  return path;
}

export function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  cpSync(join(ROOT, 'public'), DIST, { recursive: true });

  const pages = [];
  pages.push(write('/', renderHome()));
  pages.push(write('/blog/', renderIndex()));
  for (const p of POSTS) pages.push(write(`/blog/${p.slug}/`, renderPost(p)));
  pages.push(write('/privacy/', renderPrivacy()));
  pages.push(write('/terms/', renderTerms()));
  write('/404.html', renderNotFound());

  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map(p => `  <url><loc>${SITE.origin}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);
  writeFileSync(join(DIST, '.nojekyll'), '');
  return pages;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pages = build();
  console.log(`built ${pages.length} pages + 404 into dist/`);
  if (!existsSync(join(DIST, 'CNAME'))) console.warn('warning: no CNAME in dist');
}
