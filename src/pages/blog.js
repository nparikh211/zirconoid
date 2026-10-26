import { readFileSync } from 'node:fs';
import { SITE, esc, plain, ORGANIZATION, WEBSITE, ORG_ID, SITE_ID, breadcrumbs } from '../site.js';
import { layout } from '../layout.js';

// Drop a leading block marker (see renderBlocks) for word counts and plain text.
export const stripMarker = t => String(t).replace(/^(## |- |\d+\. )/, '');

const RAW = JSON.parse(readFileSync(new URL('../content/posts.json', import.meta.url), 'utf8'));

// Counted from the text at 200 words a minute, so the label can never drift from the post.
// `updatedIso` is the date the wording last changed; it carries the published date when absent.
export const POSTS = RAW.map(p => {
  const faqText = (p.faq || []).map(f => `${f.q} ${f.a}`).join(' ');
  const words = [...p.body.map(stripMarker), faqText].join(' ').trim().split(/\s+/).length;
  return { ...p, words, read: `${Math.max(1, Math.round(words / 200))} min read`, updatedIso: p.updatedIso || p.isoDate };
});

// Turn bare email addresses in post copy into mailto links.
const linkify = s => esc(s).replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

// Optional block markers in post bodies: "## " = h2, "- " = bullet, "1. " = numbered item.
// Plain strings stay paragraphs, so older posts render exactly as before.
const H2 = /^## /, LI = /^- /, OL = /^\d+\. /;
const anchor = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// A short lead-in ending in ":" or "." (a term or checklist step) is set in bold.
const leadBold = t => linkify(t).replace(/^([^:.]{2,40}[:.])\s/, '<strong>$1</strong> ');

export function renderBlocks(body, indent = '        ') {
  const out = [];
  let list = null;
  const close = () => { if (list) { out.push(`${indent}</${list}>`); list = null; } };
  for (const t of body) {
    if (H2.test(t)) { close(); const h = stripMarker(t); out.push(`${indent}<h2 id="${anchor(h)}">${esc(h)}</h2>`); continue; }
    if (LI.test(t) || OL.test(t)) {
      const kind = LI.test(t) ? 'ul' : 'ol';
      if (list !== kind) { close(); out.push(`${indent}<${kind}>`); list = kind; }
      out.push(`${indent}  <li>${leadBold(stripMarker(t))}</li>`);
      continue;
    }
    close();
    out.push(`${indent}<p>${linkify(t)}</p>`);
  }
  close();
  return out.join('\n');
}

// Visible FAQ block for posts that carry `faq: [{ q, a }]`. Mirrors the FAQPage JSON-LD.
export function renderFaq(faq, indent = '        ') {
  if (!faq || !faq.length) return '';
  return [`${indent}<h2 id="frequently-asked-questions">Frequently asked questions</h2>`,
    ...faq.map(f => `${indent}<h3>${esc(f.q)}</h3>\n${indent}<p>${linkify(f.a)}</p>`)].join('\n');
}

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
  <div class="page__inner page__inner--wide paper" data-paper>
    <div class="paper__inner">
      <p class="eyebrow">Blog</p>
      <h1 class="page__title blog__title">Notes on capture, operators, and ground truth.</h1>
      <div class="post-list">${items}
      </div>
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
    paper: true,
    jsonLd,
    modified: POSTS.map(p => p.updatedIso).sort().pop(),
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
      description: p.metaDescription || p.excerpt,
      articleBody: p.body.map(t => plain(stripMarker(t))).join('\n\n'),
      wordCount: p.words,
      datePublished: p.isoDate,
      dateModified: p.updatedIso,
      articleSection: p.tag,
      keywords: (p.keywords || SITE.topics).join(', '),
      inLanguage: 'en',
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      image: `${SITE.origin}/assets/img/og.jpg`,
      isPartOf: { '@id': `${SITE.origin}/blog/#blog` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog/' }, { name: p.title, path: `/blog/${p.slug}/` }]),
  ];
  if (p.faq && p.faq.length) {
    jsonLd.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#article` },
      mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  // FAQ sits before trailing "Sources:" lines so the closing paragraph and sources stay last.
  const srcAt = p.body.findIndex(t => /^Sources: /.test(t));
  const main = srcAt < 0 ? p.body : p.body.slice(0, srcAt);
  const tail = srcAt < 0 ? [] : p.body.slice(srcAt);

  const body = `
<main class="page">
  <article class="page__inner paper" data-paper>
    <div class="paper__inner">
      <a class="post__back" href="../">← All posts</a>
      <p class="post__meta">${esc(p.tag)} · <time datetime="${p.isoDate}">${esc(p.date)}</time> · ${esc(p.read)}</p>
      <h1 class="page__title post__title">${esc(p.title)}</h1>
      <div class="post__body">
${renderBlocks(main)}${p.faq && p.faq.length ? '\n' + renderFaq(p.faq) : ''}${tail.length ? '\n' + renderBlocks(tail) : ''}
      </div>
      <div class="post__foot">
        <span>Questions about this work?</span>
        <a href="mailto:${SITE.email}">${SITE.email} →</a>
      </div>
    </div>
  </article>
</main>`;

  return layout({
    path: `/blog/${p.slug}/`,
    title: `${p.title} — Zirconoid`,
    description: p.metaDescription || p.excerpt,
    body,
    current: 'blog',
    paper: true,
    jsonLd,
    ogType: 'article',
    published: p.isoDate,
    modified: p.updatedIso,
  });
}
