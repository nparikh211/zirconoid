import { test, expect } from '@playwright/test';
import { open, watch } from './helpers.mjs';

test.describe('samples gallery', () => {
  test('samples page shows four playable cards', async ({ page }) => {
    const errors = watch(page);
    await open(page, '/samples/', { galaxy: false });
    await expect(page.locator('h1')).toHaveText('Sample Datasets');
    await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText('Sample Datasets');
    const cards = page.locator('[data-sample-card]');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toContainText('WIRE STRIPPING');
    await expect(cards.nth(0)).toContainText('Task');
    await expect(cards.nth(0)).toContainText('Environment');
    await expect(cards.nth(0)).toContainText('Inventory');
    await expect(page.locator('.sample-card__thumbs img')).toHaveCount(8);
    await expect(page.locator('.sample-card__play')).toHaveCount(4);
    await expect(page.locator('.sample-card__field-k').first()).toHaveText('Task');

    await cards.nth(0).click();
    const lightbox = page.locator('[data-video-lightbox]');
    await expect(lightbox).toBeVisible();
    await expect(page.locator('[data-video-title]')).toContainText('WIRE STRIPPING');
    const player = page.locator('[data-video-player]');
    await expect(player).toHaveAttribute('src', /wire-stripping\.mp4/);
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();

    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !/play\(\)|AbortError|NotAllowedError/i.test(e))).toEqual([]);
  });

  test('sample videos and posters resolve', async ({ request }) => {
    for (const id of ['wire-stripping', 'soldering', 'pcb-stuffing', 'plastic-clipping']) {
      expect((await request.get(`/assets/video/samples/${id}.mp4`)).status()).toBe(200);
      expect((await request.get(`/assets/img/samples/${id}-a.jpg`)).status()).toBe(200);
      expect((await request.get(`/assets/img/samples/${id}-b.jpg`)).status()).toBe(200);
    }
  });
});
