// Static checks on dist/: every internal link and asset resolves, every page has the basics.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const htmlFiles = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(DIST);

const errors = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length);
  for (const [name, re] of [['<title>', /<title>[^<]+<\/title>/], ['lang', /<html lang="en">/], ['description', /<meta name="description" content="[^"]+"/], ['canonical', /<link rel="canonical"/], ['h1', /<h1[\s>]/]]) {
    if (!re.test(html)) errors.push(`${rel}: missing ${name}`);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errors.push(`${rel}: expected exactly one <h1>`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) errors.push(`${rel}: <img> without alt`);
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    let target = clean.startsWith('/') ? join(DIST, clean) : resolve(dirname(file), clean);
    if (clean.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target)) errors.push(`${rel}: broken link ${url}`);
  }
  // Structured data must parse and name a type on every page.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = data['@graph'] || [data];
      if (!nodes.length || nodes.some(n => !n['@type'])) errors.push(`${rel}: JSON-LD node without @type`);
    } catch (e) { errors.push(`${rel}: JSON-LD does not parse (${e.message})`); }
  }
  if (!/ld\+json/.test(html) && !rel.includes('404')) errors.push(`${rel}: no structured data`);
  if (!/<meta name="robots"/.test(html)) errors.push(`${rel}: missing robots meta`);
}

for (const f of ['CNAME', 'sitemap.xml', 'robots.txt', 'feed.xml', 'llms.txt', 'llms-full.txt', '404.html', '.nojekyll']) if (!existsSync(join(DIST, f))) errors.push(`missing ${f}`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`checked ${htmlFiles.length} pages: ok`);
