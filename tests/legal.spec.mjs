import { test, expect } from '@playwright/test';
import { EFFECTIVE, PRIVACY, TERMS } from '../src/pages/legal.js';

// Section counts and headings come from the source, so adding a clause never fails the test for
// the wrong reason. What it checks is that every section made it onto the page, numbered in order.
const headings = ({ sections }) => sections.map(([h], i) => `${i + 1}. ${h.replace(/^\d+\.\s*/, '')}`);

test('privacy policy names Zirconoid Inc. and has every section', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Privacy Policy');
  await expect(page.locator('.page__meta')).toHaveText(`Zirconoid Inc. · ${EFFECTIVE}`);
  await expect(page.locator('.legal h2')).toHaveText(headings(PRIVACY));
  await expect(page.locator('.legal h2').last()).toHaveText(/\. Contact$/);
  await expect(page.locator('body')).not.toContainText(/proximal/i);
  await expect(page.locator('footer a[href="../privacy/"]')).toHaveAttribute('aria-current', 'page');
});

test('terms name Zirconoid Inc., link to privacy, and have every section', async ({ page }) => {
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Terms of Service');
  await expect(page.locator('.legal h2')).toHaveText(headings(TERMS));
  await expect(page.locator('.legal')).toContainText('State of Delaware');
  await expect(page.locator('body')).not.toContainText(/proximal/i);
  await page.locator('.legal a[href="../privacy/"]').click();
  await expect(page).toHaveURL(/\/privacy\/$/);
});
