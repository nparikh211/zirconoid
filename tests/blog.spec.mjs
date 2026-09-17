import { test, expect } from '@playwright/test';
import { stub } from './helpers.mjs';

const POSTS = [
  ['announcing-zirconoid', 'Announcing Zirconoid'],
  ['egocentric-capture', 'Why egocentric capture is the hardest data to fake'],
  ['operators-by-the-hour', 'How we recruit operators by the hour'],
  ['expert-trajectories', 'Structuring expert reasoning for agent and RL training'],
];

// The paper texture is WebGL, and software WebGL on a runner takes seconds per sheet. Only the
// test that looks at the texture needs it; everything else reads layout, colour and routing,
// which the sheet carries on its own.
const NEEDS_SHADER = 'the paper texture paints behind the words';
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title !== NEEDS_SHADER) await stub(page, '**/assets/js/paper.js*');
});

test('blog index lists every post', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('h1')).toHaveText('Notes on capture, operators, and ground truth.');
  await expect(page.locator('.post-list__item')).toHaveCount(4);
  await expect(page.locator('.post-list__title')).toHaveText(POSTS.map(p => p[1]));
  await expect(page.locator('header .nav__link')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-nav]')).toHaveCSS('position', 'sticky');
  expect(await page.locator('.nav__blur').evaluate(el => getComputedStyle(el).backdropFilter)).toBe('blur(4px)');
});

for (const [slug, title] of POSTS) {
  test(`post ${slug} opens from the index`, async ({ page }) => {
    await page.goto('/blog/');
    await page.locator('.post-list__item', { hasText: title }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${slug}/$`));
    await expect(page.locator('h1')).toHaveText(title);
    expect(await page.locator('.post__body p').count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('.post__foot a')).toHaveAttribute('href', 'mailto:data@zirconoid.com');
    await page.locator('.post__back').click();
    await expect(page).toHaveURL(/\/blog\/$/);
  });
}

// Every post has to say that we partner with the sites, not only that we recruit people.
// The posts read as an individual-recruiting business otherwise.
test('every post names the sites we work with, not only the operators', async ({ page }) => {
  const SITES = /factor(y|ies)|workshop|plant|fab|mill|foundr|logistics|hub|refiner|institution|centre|center/i;
  for (const [slug] of POSTS) {
    await page.goto(`/blog/${slug}/`);
    const text = await page.locator('.post__body').innerText();
    expect(text, `${slug} should mention the places the work happens`).toMatch(SITES);
    expect(text, `${slug} should say we partner with them`).toMatch(/partner|agreement|site/i);
  }
});

test('reading time is counted from the post itself', async ({ page }) => {
  await page.goto('/blog/announcing-zirconoid/');
  const words = (await page.locator('.post__body').innerText()).trim().split(/\s+/).length;
  const said = parseInt((await page.locator('.post__meta').innerText()).match(/(\d+) min read/)[1], 10);
  expect(Math.abs(said - Math.max(1, Math.round(words / 200))), 'the label should match the text').toBeLessThanOrEqual(1);
});

// The blog reads as ink on paper: a light sheet with rounded corners, sitting on the dark page.
test('the blog sits on a paper sheet', async ({ page }) => {
  for (const path of ['/blog/', '/blog/announcing-zirconoid/']) {
    await page.goto(path);
    const sheet = page.locator('[data-paper]');
    await expect(sheet).toHaveCount(1);
    await expect(sheet).toHaveCSS('border-radius', '14px');
    await expect(sheet).toHaveCSS('overflow', 'hidden');       // the canvas is clipped to them
    const { sheetLum, textLum, pageLum } = await page.evaluate(() => {
      const lum = el => {
        const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g).map(Number);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      };
      const ink = getComputedStyle(document.querySelector('[data-paper] h1')).color.match(/\d+/g).map(Number);
      return {
        sheetLum: lum(document.querySelector('[data-paper]')),
        pageLum: lum(document.querySelector('.site')),
        textLum: (0.2126 * ink[0] + 0.7152 * ink[1] + 0.0722 * ink[2]) / 255,
      };
    });
    expect(sheetLum, `${path}: the sheet should be light`).toBeGreaterThan(0.8);
    expect(textLum, `${path}: the text should be near black`).toBeLessThan(0.2);
    expect(pageLum, `${path}: the page behind it stays dark`).toBeLessThan(0.2);
  }
});

test('the paper texture paints behind the words', async ({ page }) => {
  test.setTimeout(120_000);      // software WebGL takes its time with a sheet this size
  await page.goto('/blog/announcing-zirconoid/');
  const sheet = page.locator('[data-paper]');
  await expect(sheet).toHaveAttribute('data-paper-ready', '', { timeout: 90_000 });
  const canvas = sheet.locator('canvas');
  await expect(canvas).toHaveCount(1);
  // It covers the whole sheet and sits behind the text, never over it.
  const { cw, ch, sw, sh, z } = await sheet.evaluate(el => {
    const c = el.querySelector('canvas'), r = el.getBoundingClientRect();
    return { cw: c.width, ch: c.height, sw: Math.round(r.width), sh: Math.round(r.height), z: getComputedStyle(c).zIndex };
  });
  expect(z).toBe('-1');
  expect(cw / sw, 'the grain should render at the sheet size or better').toBeGreaterThanOrEqual(1);
  expect(Math.abs(cw / ch - sw / sh), 'the canvas should match the sheet shape').toBeLessThan(0.02);
});

test('the sheet still reads without the shader', async ({ page }) => {
  await stub(page, '**/assets/js/paper.js*');
  await page.goto('/blog/announcing-zirconoid/');
  const sheet = page.locator('[data-paper]');
  await expect(sheet).not.toHaveAttribute('data-paper-ready', '');
  await expect(sheet.locator('canvas')).toHaveCount(0);
  await expect(sheet).toHaveCSS('background-color', 'rgb(253, 252, 247)');
  await expect(page.locator('.post__body p').first()).toHaveCSS('color', 'rgb(0, 0, 0)');
});

test('the rest of the site keeps its dark pages', async ({ page }) => {
  for (const path of ['/', '/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('[data-paper]')).toHaveCount(0);
    await expect(page.locator('.site')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  }
});

test('old hash links redirect to the post page', async ({ page }) => {
  await page.goto('/blog/#egocentric-capture');
  await expect(page).toHaveURL(/\/blog\/egocentric-capture\/$/);
  await expect(page.locator('h1')).toHaveText('Why egocentric capture is the hardest data to fake');
});

test('post pages carry article metadata', async ({ page }) => {
  await page.goto('/blog/announcing-zirconoid/');
  const nodes = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
  expect(nodes.find(n => n['@type'] === 'BlogPosting')).toMatchObject({ headline: 'Announcing Zirconoid', datePublished: '2026-09-15' });
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://zirconoid.com/blog/announcing-zirconoid/');
});
