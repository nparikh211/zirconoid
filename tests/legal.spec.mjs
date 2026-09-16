import { test, expect } from '@playwright/test';

test('privacy policy names Zirconoid Inc. and has every section', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Privacy Policy');
  await expect(page.locator('.page__meta')).toHaveText('Zirconoid Inc. · Effective September 15, 2026');
  await expect(page.locator('.legal h2')).toHaveCount(10);
  await expect(page.locator('.legal h2').first()).toHaveText('1. Information we collect');
  await expect(page.locator('.legal h2').last()).toHaveText('10. Contact');
  await expect(page.locator('body')).not.toContainText(/proximal/i);
  await expect(page.locator('footer a[href="../privacy/"]')).toHaveAttribute('aria-current', 'page');
});

test('terms name Zirconoid Inc., link to privacy, and have every section', async ({ page }) => {
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Terms of Service');
  await expect(page.locator('.legal h2')).toHaveCount(14);
  await expect(page.locator('.legal')).toContainText('State of Delaware');
  await expect(page.locator('body')).not.toContainText(/proximal/i);
  await page.locator('.legal a[href="../privacy/"]').click();
  await expect(page).toHaveURL(/\/privacy\/$/);
});
