// Build the static site into dist/.
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, plain } from '../src/site.js';
import { render as renderHome, HEADLINE, BELIEF, DATASETS, FAQ } from '../src/pages/home.js';
import { POSTS, renderIndex, renderPost } from '../src/pages/blog.js';
import { PRIVACY, TERMS, EFFECTIVE_ISO, renderPrivacy, renderTerms } from '../src/pages/legal.js';
import { render as renderNotFound } from '../src/pages/notfound.js';
import { render as renderSamples, CATALOG } from '../src/pages/samples.js';
import { render as renderBuy } from '../src/pages/buy.js';
import { render as renderDataLicense } from '../src/pages/data-license.js';
import { render as renderTermsOfSale } from '../src/pages/terms-of-sale.js';
import { robotsTxt } from './robots.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function write(path, html) {
  const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  return path;
}

/** Every indexable page, with the date its content last changed. */
function pageList() {
  const newestPost = POSTS.map(p => p.updatedIso).sort().pop();
  return [
    { path: '/', lastmod: SITE.updated, priority: '1.0', changefreq: 'monthly' },
    { path: '/samples/', lastmod: SITE.updated, priority: '0.8', changefreq: 'monthly' },
    { path: '/blog/', lastmod: newestPost, priority: '0.8', changefreq: 'weekly' },
    ...POSTS.map(p => ({ path: `/blog/${p.slug}/`, lastmod: p.updatedIso, priority: '0.7', changefreq: 'yearly' })),
    { path: '/privacy/', lastmod: EFFECTIVE_ISO, priority: '0.3', changefreq: 'yearly' },
    { path: '/terms/', lastmod: EFFECTIVE_ISO, priority: '0.3', changefreq: 'yearly' },
  ];
}

function sitemap(pages) {
  const urls = pages.map(p => `  <url>
    <loc>${SITE.origin}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function feed() {
  const items = POSTS.map(p => `  <item>
    <title>${xml(p.title)}</title>
    <link>${SITE.origin}/blog/${p.slug}/</link>
    <guid isPermaLink="true">${SITE.origin}/blog/${p.slug}/</guid>
    <pubDate>${new Date(p.isoDate + 'T12:00:00Z').toUTCString()}</pubDate>
    <category>${xml(p.tag)}</category>
    <description>${xml(p.excerpt)}</description>
    <content:encoded><![CDATA[${p.body.map(t => `<p>${t}</p>`).join('\n')}]]></content:encoded>
  </item>`).join('\n');
  const newest = POSTS.map(p => p.isoDate).sort().pop();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Zirconoid blog</title>
  <link>${SITE.origin}/blog/</link>
  <atom:link href="${SITE.origin}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Notes on capture, operators, and ground truth from Zirconoid.</description>
  <language>en</language>
  <lastBuildDate>${new Date(newest + 'T12:00:00Z').toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

/** llms.txt: a short map of the site for language models (llmstxt.org). */
function llmsTxt() {
  return `# ${SITE.name}

> ${SITE.description}

Zirconoid Inc. is a talent engine for operator data. We recruit operators and domain experts, run the capture, and deliver the resulting datasets to the data companies that supply frontier AI labs. Our core belief is that data complex enough to teach today's frontier models is bottlenecked by access to human operators and the datasets they produce. Engineering systems that solve technical problems get commoditized; fresh human-collected and operator-collected data does not.

Contact: ${SITE.email}. Operating worldwide.

## Pages

- [Home](${SITE.origin}/): what Zirconoid does, featured sample datasets from real benches, and answers to common questions.
- [Sample Datasets](${SITE.origin}/samples/): playable egocentric sample clips with task, environment, and inventory tags.
- [Blog](${SITE.origin}/blog/): notes on capture, operators, and ground truth.
${POSTS.map(p => `- [${p.title}](${SITE.origin}/blog/${p.slug}/): ${p.excerpt}`).join('\n')}
- [Privacy Policy](${SITE.origin}/privacy/): how Zirconoid Inc. collects, uses, and shares personal information.
- [Terms of Service](${SITE.origin}/terms/): terms governing use of zirconoid.com and related services.

## Featured sample datasets

${DATASETS.map(d => `- **${d.title}**: ${d.desc} Task: ${d.task}. Environment: ${d.environment}. Inventory: ${d.inventory}.`).join('\n')}

## Optional

- [Full site text](${SITE.origin}/llms-full.txt): every page as plain text.
- [RSS feed](${SITE.origin}/feed.xml)
- [Sitemap](${SITE.origin}/sitemap.xml)
`;
}

/** llms-full.txt: the whole site as plain text, so a model needs one fetch. */
function llmsFullTxt() {
  const legal = ({ title, intro, sections }) => `# ${title}\n\n${SITE.legalName} · Effective September 15, 2026\n\n${plain(intro)}\n\n${sections.map(([h, ...ps]) => `## ${h}\n\n${ps.map(plain).join('\n\n')}`).join('\n\n')}`;
  return [
    `# ${SITE.name} — full site text`,
    `Source: ${SITE.origin}/ · Last updated ${SITE.updated}`,
    '',
    '# Home',
    '',
    `## ${HEADLINE}`,
    '',
    BELIEF.join('\n\n'),
    '',
    '## Our work: datasets collected by real people',
    '',
    DATASETS.map(d => `### ${d.title}\n\n${d.desc}\n\n- Task: ${d.task}\n- Environment: ${d.environment}\n- Inventory: ${d.inventory}\n- Video: ${SITE.origin}/assets/video/samples/${d.video}`).join('\n\n'),
    '',
    '## Questions',
    '',
    FAQ.map(f => `### ${f.q}\n\n${f.a}`).join('\n\n'),
    '',
    '## Work with us',
    '',
    `Talk to a data expert. Tell us the domain and volume you need. We will return a scoped sample and a capture plan. Email ${SITE.email}.`,
    '',
    '# Sample Datasets',
    '',
    CATALOG.map(s => `## ${s.title}\n\n${s.desc}\n\n- Duration: ${s.duration}\n- Task: ${s.task}\n- Environment: ${s.environment}\n- Inventory: ${s.inventory}\n- Video: ${SITE.origin}/assets/video/samples/${s.video}`).join('\n\n'),
    '',
    '# Blog',
    '',
    POSTS.map(p => `## ${p.title}\n\n${p.tag} · ${p.date} · ${p.read} · ${SITE.origin}/blog/${p.slug}/\n\n${p.body.map(plain).join('\n\n')}`).join('\n\n'),
    '',
    legal(PRIVACY),
    '',
    legal(TERMS),
    '',
  ].join('\n');
}


/** Decode *.b64 text sidecars (and numbered .b64.NN chunks) into binary files in dist/. */
function decodeB64Sidecars(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const name of entries) {
    const p = join(dir, name.name);
    if (name.isDirectory()) decodeB64Sidecars(p);
  }
  // Merge split chunks: foo.mp4.b64.00 + foo.mp4.b64.01 → foo.mp4.b64
  const files = readdirSync(dir);
  const chunkRe = /^(.*\.b64)\.(\d{2})$/;
  const groups = new Map();
  for (const f of files) {
    const m = chunkRe.exec(f);
    if (!m) continue;
    if (!groups.has(m[1])) groups.set(m[1], []);
    groups.get(m[1]).push([m[2], f]);
  }
  for (const [base, parts] of groups) {
    parts.sort((a, b) => a[0].localeCompare(b[0]));
    const merged = parts.map(([, f]) => readFileSync(join(dir, f), 'utf8')).join('');
    writeFileSync(join(dir, base), merged);
    for (const [, f] of parts) unlinkSync(join(dir, f));
  }
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.b64')) continue;
    const p = join(dir, f);
    writeFileSync(p.slice(0, -4), Buffer.from(readFileSync(p, 'utf8'), 'base64'));
    unlinkSync(p);
  }
}

export function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  cpSync(join(ROOT, 'public'), DIST, { recursive: true });
  decodeB64Sidecars(DIST);

  write('/', renderHome());
  write('/samples/', renderSamples());
  write('/blog/', renderIndex());
  for (const p of POSTS) write(`/blog/${p.slug}/`, renderPost(p));
  write('/privacy/', renderPrivacy());
  write('/terms/', renderTerms());
  write('/buy/', renderBuy()); // URL-only; omitted from sitemap / llms
  write('/data-license/', renderDataLicense()); // URL-only; linked from /buy only
  write('/terms-of-sale/', renderTermsOfSale()); // URL-only; linked from /buy only
  write('/404.html', renderNotFound());

  const pages = pageList();
  writeFileSync(join(DIST, 'sitemap.xml'), sitemap(pages));
  writeFileSync(join(DIST, 'feed.xml'), feed());
  writeFileSync(join(DIST, 'robots.txt'), robotsTxt(SITE.origin));
  writeFileSync(join(DIST, 'llms.txt'), llmsTxt());
  writeFileSync(join(DIST, 'llms-full.txt'), llmsFullTxt());
  writeFileSync(join(DIST, '.nojekyll'), '');
  return pages.map(p => p.path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pages = build();
  console.log(`built ${pages.length} pages + 404, sitemap, feed, robots and llms files into dist/`);
  if (!existsSync(join(DIST, 'CNAME'))) console.warn('warning: no CNAME in dist');
}
