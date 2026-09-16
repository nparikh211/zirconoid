import { test, expect } from '@playwright/test';
import { watch, PAGES, expectNoOverflow } from './helpers.mjs';

for (const path of PAGES) {
  test(`${path} loads clean`, async ({ page }) => {
    const errors = watch(page);
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/Zirconoid/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.nav__brand')).toHaveText('Zirconoid');
    await expect(page.locator('header .btn')).toHaveAttribute('href', /mailto:data@zirconoid\.com\?subject=Sample%20dataset%20request/);
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
