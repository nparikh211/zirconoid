import { test, expect } from '@playwright/test';
import { watch, PAGES, expectNoOverflow, stub } from './helpers.mjs';

// Software WebGL takes seconds per sheet, so only the first post runs the paper texture here.
// One page is enough to prove the script loads and logs nothing; blog.spec.mjs checks the rest.
const SHADER_PAGE = '/blog/announcing-zirconoid/';

for (const path of PAGES) {
  test(`${path} loads clean`, async ({ page }) => {
    const errors = watch(page);
    if (path !== SHADER_PAGE) await stub(page, '**/assets/js/paper.js*');
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/Zirconoid/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.nav__brand')).toHaveText('Zirconoid');
    const sampleBtn = page.locator('header .btn[data-sample-open]');
    await expect(sampleBtn).toHaveCount(1);
    await expect(sampleBtn).toHaveAttribute('type', 'button');
    await expect(sampleBtn).toHaveText(/Talk to a Data Expert/);
    await expect(page.locator('[data-sample-modal]')).toHaveCount(1);
    await expect(page.locator('[data-sample-modal]')).toHaveAttribute('hidden', '');
    // Versioned asset URLs, so a CDN cannot pair this HTML with stale CSS or JS. Only our own
    // files carry a hash; a third-party tag is served from someone else's origin.
    const ours = u => u && !/^https?:/.test(u);
    for (const href of await page.locator('link[rel="stylesheet"]').evaluateAll(els => els.map(e => e.getAttribute('href')))) expect(href).toMatch(/\?v=[0-9a-f]{10}$/);
    for (const src of await page.locator('script[src]').evaluateAll(els => els.map(e => e.getAttribute('src')))) {
      if (ours(src)) expect(src, `${src} should carry a content hash`).toMatch(/\?v=[0-9a-f]{10}$/);
    }
    await expect(page.locator('header .btn .btn__star')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('© 2026 Zirconoid. Worldwide.');
    await expectNoOverflow(page);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('fonts are self-hosted and load', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => ['700 13px Montserrat', '300 15px "IBM Plex Sans"', '400 12px "JetBrains Mono"'].map(f => document.fonts.check(f)));
  expect(loaded).toEqual([true, true, true]);
  expect(requests.filter(u => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
});

test('unknown URL serves the 404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('That page is not here.');
  await expect(page.locator('main a[href="/"]')).toBeVisible();
  await expect(page.locator('.nav__brand')).toHaveAttribute('href', '/');
});

test('sitemap and robots exist', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const p of PAGES) expect(xml).toContain(`https://zirconoid.com${p}`);
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://zirconoid.com/sitemap.xml');
  expect((await (await request.get('/CNAME')).text()).trim()).toBe('zirconoid.com');
});
