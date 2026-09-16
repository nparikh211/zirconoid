import { readFileSync } from 'node:fs';
import { SITE, esc, plain, ORGANIZATION, WEBSITE, ORG_ID, SITE_ID, breadcrumbs } from '../site.js';
import { layout } from '../layout.js';

export const POSTS = JSON.parse(readFileSync(new URL('../content/posts.json', import.meta.url), 'utf8'));

// Turn bare email addresses in post copy into mailto links.
const linkify = s => esc(s).replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

export function renderIndex() {
  const items = POSTS.map(p => `
        <a class="post-list__item" href="${p.slug}/">
          <div class="post-list__body">
            <span class="post-list__meta">${esc(p.tag)} · ${esc(p.date)} · ${esc(p.read)}</span>
            <span class="post-list__title">${esc(p.title)}</span>
            <span class="post-list__excerpt">${esc(p.excerpt)}</span>
          </div>
          <span class="post-list__read">Read →</span>
        </a>`).join('');

  const body = `
<main class="page">
  <div class="page__inner page__inner--wide">
    <p class="eyebrow">Blog</p>
    <h1 class="page__title blog__title">Notes on capture, operators, and ground truth.</h1>
    <div class="post-list">${items}
    </div>
  </div>
</main>
<script>
// Old links used "blog/#slug". Send them to the post's own page.
(function () { var s = location.hash.replace('#', ''); if (s && /^[a-z0-9-]+$/.test(s)) location.replace(s + '/'); })();
</script>`;

  const jsonLd = [
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'Blog',
      '@id': `${SITE.origin}/blog/#blog`,
      url: `${SITE.origin}/blog/`,
      name: 'Zirconoid blog',
      description: 'Notes on capture, operators, and ground truth from Zirconoid.',
      inLanguage: 'en',
      publisher: { '@id': ORG_ID },
      isPartOf: { '@id': SITE_ID },
      blogPost: POSTS.map(p => ({
        '@type': 'BlogPosting',
        '@id': `${SITE.origin}/blog/${p.slug}/#article`,
        headline: p.title,
        description: p.excerpt,
        datePublished: p.isoDate,
        url: `${SITE.origin}/blog/${p.slug}/`,
        author: { '@id': ORG_ID },
      })),
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog/' }]),
  ];

  return layout({
    path: '/blog/',
    title: 'Blog — Zirconoid',
    description: 'Notes on capture, operators, and ground truth from Zirconoid.',
    body,
    current: 'blog',
    jsonLd,
    modified: POSTS.map(p => p.isoDate).sort().pop(),
  });
}

export function renderPost(p) {
  const url = `${SITE.origin}/blog/${p.slug}/`;
  const jsonLd = [
    ORGANIZATION,
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: p.title,
      name: p.title,
      description: p.excerpt,
      articleBody: p.body.map(plain).join('\n\n'),
      wordCount: p.body.join(' ').split(/\s+/).length,
      datePublished: p.isoDate,
      dateModified: p.isoDate,
      articleSection: p.tag,
      keywords: SITE.topics.join(', '),
      inLanguage: 'en',
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      image: `${SITE.origin}/assets/img/og.jpg`,
      isPartOf: { '@id': `${SITE.origin}/blog/#blog` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog/' }, { name: p.title, path: `/blog/${p.slug}/` }]),
  ];

  const body = `
<main class="page">
  <article class="page__inner">
    <a class="post__back" href="../">← All posts</a>
    <p class="post__meta">${esc(p.tag)} · <time datetime="${p.isoDate}">${esc(p.date)}</time> · ${esc(p.read)}</p>
    <h1 class="page__title post__title">${esc(p.title)}</h1>
    <div class="post__body">
${p.body.map(t => `      <p>${linkify(t)}</p>`).join('\n')}
    </div>
    <div class="post__foot">
      <span>Questions about this work?</span>
      <a href="mailto:${SITE.email}">${SITE.email} →</a>
    </div>
  </article>
</main>`;

  return layout({
    path: `/blog/${p.slug}/`,
    title: `${p.title} — Zirconoid`,
    description: p.excerpt,
    body,
    current: 'blog',
    jsonLd,
    ogType: 'article',
    published: p.isoDate,
    modified: p.isoDate,
  });
}
