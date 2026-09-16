import { test, expect } from '@playwright/test';

const POSTS = [
  ['announcing-zirconoid', 'Announcing Zirconoid'],
  ['egocentric-capture', 'Why egocentric capture is the hardest data to fake'],
  ['operators-by-the-hour', 'How we recruit operators by the hour'],
  ['expert-trajectories', 'Structuring expert reasoning for agent and RL training'],
];

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
