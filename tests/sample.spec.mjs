import { test, expect } from '@playwright/test';
import { open } from './helpers.mjs';

test.describe('sample request form', () => {
  test('sample request buttons open the modal', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const modal = page.locator('[data-sample-modal]');
    const panel = page.locator('[data-sample-panel]');
    await expect(modal).toBeHidden();

    await page.locator('header [data-sample-open]').click();
    await expect(modal).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'dialog');
    await expect(panel).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#sample-dialog-title')).toHaveText('Request a sample dataset');
    await expect(page.locator('[data-sample-form]')).toBeVisible();
    await expect(page.locator('[data-sample-thanks]')).toBeHidden();

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();

    await page.locator('.cta [data-sample-open]').scrollIntoViewIfNeeded();
    await page.locator('.cta [data-sample-open]').click();
    await expect(modal).toBeVisible();

    await page.locator('.sample-modal__backdrop').click({ position: { x: 2, y: 2 } });
    await expect(modal).toBeHidden();
  });

  test('sample form shows thank-you after a successful FormSubmit', async ({ page }) => {
    await page.route('https://formsubmit.co/ajax/data@zirconoid.com', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: 'true' }),
      });
    });
    await open(page, '/', { galaxy: false });
    await page.locator('header [data-sample-open]').click();
    await page.locator('[data-sample-form] input[name="name"]').fill('Test User');
    await page.locator('[data-sample-form] input[name="email"]').fill('test@example.com');
    await page.locator('[data-sample-form] input[name="company"]').fill('Example Co');
    await page.locator('[data-sample-form] textarea[name="message"]').fill('Egocentric video, textile, ~10 hours');
    await page.locator('[data-sample-submit]').click();
    await expect(page.locator('[data-sample-thanks]')).toBeVisible();
    await expect(page.locator('[data-sample-form-wrap]')).toBeHidden();
    await expect(page.locator('[data-sample-thanks-copy], .sample-modal__thanks-copy')).toHaveText(
      "Thank you, and we'll get back to you within a few hours.");
  });

  test('sample form keeps the form and shows an error when FormSubmit fails', async ({ page }) => {
    await page.route('https://formsubmit.co/ajax/data@zirconoid.com', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"fail"}' });
    });
    await open(page, '/', { galaxy: false });
    await page.locator('header [data-sample-open]').click();
    await page.locator('[data-sample-form] input[name="name"]').fill('Test User');
    await page.locator('[data-sample-form] input[name="email"]').fill('test@example.com');
    await page.locator('[data-sample-form] textarea[name="message"]').fill('Need a sample');
    await page.locator('[data-sample-submit]').click();
    await expect(page.locator('[data-sample-error]')).toBeVisible();
    await expect(page.locator('[data-sample-error]')).toContainText(/Something went wrong/);
    await expect(page.locator('[data-sample-form]')).toBeVisible();
    await expect(page.locator('[data-sample-thanks]')).toBeHidden();
  });

});
