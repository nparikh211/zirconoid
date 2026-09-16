import { SITE } from '../site.js';
import { layout } from '../layout.js';

// GitHub Pages serves /404.html for unknown paths. Links are absolute because the URL is unknown.
export function render() {
  const body = `
<main class="page">
  <div class="page__inner notfound">
    <p class="eyebrow">404</p>
    <h1 class="page__title">That page is not here.</h1>
    <p class="cta__lede">The link may be old or mistyped. Head back to the <a href="/">home page</a>, read the <a href="/blog/">blog</a>, or write to <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
  </div>
</main>`;
  // The 404 page is served for any unknown URL, so its links must be absolute.
  return layout({ path: '/404.html', title: 'Page not found — Zirconoid', description: 'The page you asked for does not exist.', body, rel: '/', robots: 'noindex,follow' });
}
