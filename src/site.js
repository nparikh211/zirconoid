// Site-wide constants shared by every page template.
export const SITE = {
  name: 'Zirconoid',
  legalName: 'Zirconoid Inc.',
  domain: 'zirconoid.com',
  origin: 'https://zirconoid.com',
  email: 'data@zirconoid.com',
  copyright: '© 2026 Zirconoid. Worldwide.',
  description: 'Zirconoid is organizing human-captured data for physical AI. We recruit operators and collect datasets for the data companies that train physical AI models.',
  // Bump when the wording on the home or legal pages changes; it feeds sitemap lastmod.
  updated: '2026-09-22',
  areaServed: 'Worldwide',
  topics: [
    'physical AI',
    'operator data collection',
    'egocentric video datasets',
    'human-captured training data',
    'expert reasoning trajectories',
    'reinforcement learning data',
    'AI training data sourcing',
    'operator recruiting',
  ],
};

SITE.sampleMailto = 'mailto:' + SITE.email + '?subject=Sample%20dataset%20request&body=' + encodeURIComponent([
  'Hi Zirconoid team,',
  '',
  "I'd like to request some sample data with the following specs: [please enter info here]",
  '',
  '[Please share a few times that you are available for a call to discuss your requirements].',
  '',
  '- [Your Name]',
].join('\r\n'));

// 8-pointed star ring used on every Talk to a Data Expert button.
export const STAR = '<svg class="btn__star" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6.00 0.00L7.76 1.75L10.24 1.76L10.25 4.24L12.00 6.00L10.25 7.76L10.24 10.24L7.76 10.25L6.00 12.00L4.24 10.25L1.76 10.24L1.75 7.76L0.00 6.00L1.75 4.24L1.76 1.76L4.24 1.75Z M6.00 2.80L6.88 3.88L8.26 3.74L8.12 5.12L9.20 6.00L8.12 6.88L8.26 8.26L6.88 8.12L6.00 9.20L5.12 8.12L3.74 8.26L3.88 6.88L2.80 6.00L3.88 5.12L3.74 3.74L5.12 3.88Z" fill="#141414" fill-rule="evenodd"></path></svg>';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Strip tags and unescape, for feeds and the plain-text llms files.
export const plain = s => String(s)
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/* ---- Shared schema.org nodes. Every page references these by @id. ---- */

export const ORG_ID = `${SITE.origin}/#organization`;
export const SITE_ID = `${SITE.origin}/#website`;

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  legalName: SITE.legalName,
  alternateName: 'Zirconoid Inc.',
  url: SITE.origin + '/',
  logo: { '@type': 'ImageObject', url: `${SITE.origin}/assets/img/icon-512.png`, width: 512, height: 512 },
  image: `${SITE.origin}/assets/img/og.jpg`,
  email: SITE.email,
  description: SITE.description,
  slogan: 'We turn pressure into permanence.',
  areaServed: SITE.areaServed,
  knowsAbout: SITE.topics,
  contactPoint: [{
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: SITE.email,
    availableLanguage: 'English',
    areaServed: SITE.areaServed,
  }],
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE.origin + '/',
  name: SITE.name,
  description: SITE.description,
  inLanguage: 'en',
  publisher: { '@id': ORG_ID },
};

export const breadcrumbs = trail => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: SITE.origin + t.path,
  })),
});
