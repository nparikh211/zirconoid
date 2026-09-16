import { readFileSync } from 'node:fs';
import { SITE, esc } from '../site.js';
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

  return layout({
    path: '/blog/',
    title: 'Blog — Zirconoid',
    description: 'Notes on capture, operators, and ground truth from Zirconoid.',
    body,
    current: 'blog',
  });
}

export function renderPost(p) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.isoDate,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
    mainEntityOfPage: `${SITE.origin}/blog/${p.slug}/`,
  });

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
  });
}
