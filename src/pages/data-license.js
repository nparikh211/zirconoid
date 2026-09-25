import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SITE, ORGANIZATION, ORG_ID, SITE_ID, WEBSITE, breadcrumbs } from '../site.js';
import { layout } from '../layout.js';
import { mdToHtml } from '../md.js';

const PATH = '/data-license/';
const DOC = join(dirname(fileURLToPath(import.meta.url)), '../../docs/DATA_LICENSE.md');

/**
 * Dataset License Agreement — URL-only (linked from /buy/ only).
 * noindex; omitted from sitemap, llms, nav, and footer.
 */
export function render() {
  const raw = readFileSync(DOC, 'utf8');
  const { title, html } = mdToHtml(raw);
  const pageTitle = title || 'Dataset License Agreement';
  const description = 'Zirconoid Dataset License Agreement (Train and Commercial SKUs). Linked from /buy checkout; not indexed.';

  const body = `
<main class="page">
  <div class="page__inner">
    <p class="eyebrow">Legal</p>
    <h1 class="page__title">${pageTitle}</h1>
    <p class="page__meta">${SITE.legalName} · Effective [DATE], Version 1.0</p>
    <div class="legal legal--md">
${html}
    </div>
  </div>
</main>`;

  const jsonLd = [
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'WebPage',
      '@id': `${SITE.origin}${PATH}#webpage`,
      url: SITE.origin + PATH,
      name: pageTitle,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      dateModified: SITE.updated,
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: pageTitle, path: PATH }]),
  ];

  return layout({
    path: PATH,
    title: `${pageTitle} — Zirconoid`,
    description,
    body,
    // Do not set current — URL-only page, not in nav/footer.
    jsonLd,
    robots: 'noindex,nofollow',
  });
}
