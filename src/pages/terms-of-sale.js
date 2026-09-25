import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SITE, ORGANIZATION, ORG_ID, SITE_ID, WEBSITE, breadcrumbs } from '../site.js';
import { layout } from '../layout.js';
import { mdToHtml } from '../md.js';

const PATH = '/terms-of-sale/';
const DOC = join(dirname(fileURLToPath(import.meta.url)), '../../docs/TERMS_OF_SALE.md');

/**
 * Online Terms of Sale — URL-only (linked from /buy/ only).
 * noindex; omitted from sitemap, llms, nav, and footer.
 */
export function render() {
  const raw = readFileSync(DOC, 'utf8');
  const { title, html } = mdToHtml(raw);
  const pageTitle = title || 'Online Terms of Sale';
  const description = 'Zirconoid Online Terms of Sale for dataset purchases on /buy. Linked from checkout; not indexed.';

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
