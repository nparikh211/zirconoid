import { test, expect } from '@playwright/test';
import { PAGES } from './helpers.mjs';

const ld = async page => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap(b => { const d = JSON.parse(b); return d['@graph'] || [d]; });
};
const typed = (nodes, type) => nodes.find(n => n['@type'] === type);

test.describe('every page', () => {
  for (const path of PAGES) {
    test(`${path} carries the search metadata`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index,follow/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /max-snippet:-1/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://zirconoid.com${path}`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://zirconoid.com${path}`);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
      await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', 'https://zirconoid.com/feed.xml');
      // Description is present and a usable length for a snippet.
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc.length).toBeGreaterThan(50);
      expect(desc.length).toBeLessThan(320);
      // Structured data parses and every node is typed.
      const nodes = await ld(page);
      expect(nodes.length).toBeGreaterThan(0);
      for (const n of nodes) expect(n['@type']).toBeTruthy();
      expect(typed(nodes, 'Organization')).toMatchObject({ name: 'Zirconoid', email: 'data@zirconoid.com' });
    });
  }
});

test('home describes the business, its service and its questions', async ({ page }) => {
  await page.goto('/');
  const nodes = await ld(page);
  expect(nodes.map(n => n['@type']).sort()).toEqual(['FAQPage', 'Organization', 'Service', 'WebPage', 'WebSite']);

  const org = typed(nodes, 'Organization');
  expect(org.knowsAbout.length).toBeGreaterThan(3);
  expect(org.areaServed).toBe('Worldwide');
  expect(org.contactPoint[0].email).toBe('data@zirconoid.com');

  const service = typed(nodes, 'Service');
  expect(service.hasOfferCatalog.itemListElement).toHaveLength(3);
  for (const offer of service.hasOfferCatalog.itemListElement) {
    expect(offer.itemOffered['@type']).toBe('Dataset');
    expect(offer.itemOffered.name).toBeTruthy();
    expect(offer.itemOffered.description.length).toBeGreaterThan(50);
  }

  // Every question in the schema is also on the page, so answers can be verified.
  // The answers sit inside <details>, which keeps them in the source for crawlers.
  const faq = typed(nodes, 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(8);
  const onPageQ = await page.locator('.faq__q-text').allTextContents();
  const onPageA = await page.locator('.faq__a').allTextContents();
  expect(onPageQ).toEqual(faq.mainEntity.map(q => q.name));
  expect(onPageA).toEqual(faq.mainEntity.map(q => q.acceptedAnswer.text));
});

test('blog index and posts are linked as a blog', async ({ page }) => {
  await page.goto('/blog/');
  const indexNodes = await ld(page);
  expect(typed(indexNodes, 'Blog').blogPost).toHaveLength(4);
  expect(typed(indexNodes, 'BreadcrumbList').itemListElement).toHaveLength(2);

  await page.goto('/blog/egocentric-capture/');
  const nodes = await ld(page);
  const post = typed(nodes, 'BlogPosting');
  expect(post.headline).toBe('Why egocentric capture is the hardest data to fake');
  expect(post.datePublished).toBe('2026-09-08');
  expect(post.wordCount).toBeGreaterThan(200);
  expect(post.articleBody).toContain('head-mounted camera');
  expect(typed(nodes, 'BreadcrumbList').itemListElement).toHaveLength(3);
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-09-08');
});

test('bing verification file is served from the root', async ({ request }) => {
  const res = await request.get('/BingSiteAuth.xml');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('15AB80F2F0D7BCCA3B66707A7A49D272');
});

test('404 is not indexed', async ({ page }) => {
  await page.goto('/no-such-page/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
});

test('robots.txt invites search and answer engines', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const txt = await res.text();
  for (const bot of ['Googlebot', 'GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent']) {
    expect(txt, `robots.txt should name ${bot}`).toContain(`User-agent: ${bot}`);
  }
  expect(txt).not.toMatch(/^Disallow: \/$/m);
  expect(txt).toContain('Sitemap: https://zirconoid.com/sitemap.xml');
  expect(txt).toContain('/llms.txt');
});

test('sitemap lists every page with a real date', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const p of PAGES) expect(xml).toContain(`<loc>https://zirconoid.com${p}</loc>`);
  expect(xml).not.toContain('/404');
  const mods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(m => m[1]);
  expect(mods).toHaveLength(PAGES.length);
  for (const m of mods) expect(m).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // The post entries carry their own publication dates, not one shared build date.
  expect(new Set(mods).size).toBeGreaterThan(1);
});

test('rss feed carries every post in full', async ({ request }) => {
  const res = await request.get('/feed.xml');
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();
  expect([...xml.matchAll(/<item>/g)]).toHaveLength(4);
  expect(xml).toContain('<title>Announcing Zirconoid</title>');
  expect(xml).toContain('content:encoded');
  expect(xml).toContain('<atom:link href="https://zirconoid.com/feed.xml"');
});

test('llms.txt maps the site and llms-full.txt holds the text', async ({ request }) => {
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms.startsWith('# Zirconoid')).toBe(true);
  expect(llms).toContain('> Zirconoid recruits operators');
  expect(llms).toContain('## Pages');
  for (const slug of ['announcing-zirconoid', 'egocentric-capture', 'operators-by-the-hour', 'expert-trajectories']) {
    expect(llms).toContain(`/blog/${slug}/`);
  }

  const full = await (await request.get('/llms-full.txt')).text();
  expect(full.length).toBeGreaterThan(9000);
  expect(full).toContain('Zirconoid collects human data for frontier training');
  expect(full).toContain('## Questions');
  expect(full).toContain('# Privacy Policy');
  expect(full).toContain('# Terms of Service');
  // Plain text only: no markup survived.
  expect(full).not.toMatch(/<\/?(p|div|strong|a|em)\b/);
});
