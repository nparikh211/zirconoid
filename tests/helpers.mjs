import { expect } from '@playwright/test';

// Collect console errors and failed requests for the life of a page. Third-party tags are
// skipped: whether someone else's CDN answers is not something this site can be tested on, and a
// runner without egress to it would fail every page.
const ours = url => !url || url.startsWith('http://localhost') || url.includes('zirconoid.com');

export function watch(page) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && ours(m.location()?.url)) errors.push(`console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('response', r => { if (r.status() >= 400 && ours(r.url())) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

export const PAGES = ['/', '/samples/', '/blog/', '/blog/announcing-zirconoid/', '/blog/egocentric-capture/', '/blog/operators-by-the-hour/', '/blog/expert-trajectories/', '/privacy/', '/terms/'];

export async function expectNoOverflow(page) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, 'page should not scroll horizontally').toBeLessThanOrEqual(iw);
}

// Serve a script as an empty module instead of the real thing. Aborting the request would do
// it too, but the browser logs a console error for a module that fails to load, which any test
// watching the console would then report.
export const stub = (page, glob) => page.route(glob, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

// Navigate and turn off smooth scrolling so programmatic scrolls land at once.
// Tests that only care about layout or CSS can drop the galaxy: software WebGL in headless
// Chromium is slow enough to starve transitions, and the galaxy has its own tests.
export async function open(page, path, { galaxy = true } = {}) {
  if (!galaxy) await stub(page, '**/assets/js/galaxy.js*');
  await page.goto(path);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
}

// An FAQ row's real state. The answer overflows a clipped zero-height panel while closed,
// so its bounding box alone would report it visible; measure the panel instead.
export const faqRow = (page, i) => page.locator('.faq__item').nth(i).evaluate(el => ({
  open: el.open,
  height: el.querySelector('.faq__panel-inner').offsetHeight,
}));

export const num = s => parseFloat(String(s).replace(/[^\d.-]/g, ''));
export const alpha = rgba => { const m = /rgba?\(\s*\d+,\s*\d+,\s*\d+(?:,\s*([\d.]+))?\)/.exec(rgba); return m && m[1] !== undefined ? parseFloat(m[1]) : 1; };
