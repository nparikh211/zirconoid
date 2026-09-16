import { test, expect } from '@playwright/test';
import { watch, open, num, alpha, faqRow } from './helpers.mjs';

test.describe('home', () => {
  test('hero copy and structure', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    await expect(page.locator('h1')).toHaveText('Zirconoid collects human data for frontier training');
    await expect(page.locator('[data-belief] p')).toHaveCount(3);
    await expect(page.locator('[data-belief] p').first()).toContainText('Zirconoid provides specialized datasets');
    await expect(page.locator('.card')).toHaveCount(3);
    await expect(page.locator('.card__title')).toHaveText([
      'Egocentric video from textile factory floors',
      '8-hour egocentric days on a motherboard assembly line',
      'Diagnosis pathways and treatment efficacy trends from oncologists',
    ]);
    await expect(page.locator('.card__domain')).toHaveText(['Textile manufacturing', 'Electronics assembly', 'Oncology']);
    // The assembly-line card carries a capture still; the other two are still waiting on one.
    await expect(page.locator('.card__media span')).toHaveText(['Coming soon', 'Coming soon']);
    const shot = page.locator('.card').nth(1).locator('.card__media--shot img');
    await expect(shot).toHaveAttribute('src', 'assets/img/work/assembly-line.jpg');
    await expect(shot).toHaveAttribute('alt', /soldering/);
    await shot.scrollIntoViewIfNeeded();   // it is lazy, so bring it into view before asking
    await expect.poll(() => shot.evaluate(el => el.naturalWidth), { message: 'the still should decode' }).toBeGreaterThan(0);
    expect(await shot.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover');
    // Held back on the page, full colour when the card is hovered.
    expect(await shot.evaluate(el => getComputedStyle(el).filter)).toMatch(/grayscale/);
    await page.locator('.card').nth(1).hover();
    await expect.poll(() => shot.evaluate(el => getComputedStyle(el).filter)).toBe('none');
    await expect(page.locator('body')).not.toContainText('placeholder:');
    await expect(page.locator('.cta .btn--lg')).toHaveText(/Request a sample dataset/);
    await expect(page.locator('.cta .mono-link')).toHaveAttribute('href', 'mailto:data@zirconoid.com');
    await expect(page.locator('.footer__bar nav a')).toHaveText(['Blog', 'Privacy', 'Terms', 'Contact']);
    // No leftover section labels the brief asked to remove.
    await expect(page.locator('body')).not.toContainText(/what we believe|how we work/i);
    for (const t of await page.locator('.card').allInnerTexts()) expect(t).not.toMatch(/^0[123]\b/);
  });

  test('trusted-by shows the lab marks around the claim', async ({ page }, testInfo) => {
    await open(page, '/', { galaxy: false });
    const logos = page.locator('.trust__logo');
    const title = page.locator('#trust-title');
    await expect(title).toHaveText('Trusted by the data providers who support the frontier');
    await expect(title).toHaveCSS('font-family', /Montserrat/); // the hero's face, smaller
    await expect(logos).toHaveCount(5);
    expect(await logos.evaluateAll(els => els.map(e => e.alt)))
      .toEqual(['OpenAI', 'Anthropic', 'Google DeepMind', 'Mistral AI', 'xAI']);
    // Real image files, decoded by the browser.
    for (const n of await logos.evaluateAll(els => els.map(e => e.naturalWidth))) expect(n).toBeGreaterThan(0);
    await expect(page.locator('.trust__note')).toHaveCount(0);

    const boxes = () => logos.evaluateAll(els => els.map(e => e.getBoundingClientRect()).map(r => ({ x: r.x, y: r.y, w: r.width, h: r.height })));
    await page.locator('.trust').scrollIntoViewIfNeeded(); // the orbit only runs while on screen
    const t = await title.boundingBox();

    if (testInfo.project.name === 'desktop') {
      // One line.
      const lines = await title.evaluate(el => el.offsetHeight / parseFloat(getComputedStyle(el).fontSize));
      expect(lines).toBeLessThan(1.6);

      const before = await boxes();
      const o = await page.locator('.trust__orbit').boundingBox();
      const cx = o.x + o.width / 2, cy = o.y + o.height / 2;

      // Every mark stays inside the section, centred on the claim.
      for (const b of before) {
        expect(b.x).toBeGreaterThanOrEqual(o.x - 1);
        expect(b.x + b.w).toBeLessThanOrEqual(o.x + o.width + 1);
        expect(b.y).toBeGreaterThanOrEqual(o.y - 1);
        expect(b.y + b.h).toBeLessThanOrEqual(o.y + o.height + 1);
      }
      // A sphere, not a ring: the marks sit at a spread of distances from the centre,
      // because the ones near the poles project inwards.
      const reach = before.map(b => Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy));
      expect(Math.max(...reach) - Math.min(...reach), 'depths should vary, not ride one ring').toBeGreaterThan(30);

      // Depth also reads as size and brightness.
      const sizes = before.map(b => b.w);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThan(8);
      const fades = await logos.evaluateAll(els => els.map(e => parseFloat(getComputedStyle(e).opacity)));
      expect(Math.max(...fades) - Math.min(...fades)).toBeGreaterThan(0.3);

      // No two marks pile up on each other.
      for (let i = 0; i < before.length; i++) {
        for (let j = i + 1; j < before.length; j++) {
          const gap = Math.hypot(
            (before[i].x + before[i].w / 2) - (before[j].x + before[j].w / 2),
            (before[i].y + before[i].h / 2) - (before[j].y + before[j].h / 2));
          expect(gap, 'two marks should not sit on top of each other').toBeGreaterThan(20);
        }
      }

      // The claim hangs inside the sphere: over a full turn each mark spends time in front of
      // the words and time behind them, and the ring never traps them in its own layer.
      await expect(title).toHaveCSS('z-index', '50');
      await expect(page.locator('.trust__ring')).toHaveCSS('z-index', 'auto');
      const seen = await page.evaluate(() => new Promise(resolve => {
        const marks = [...document.querySelectorAll('.trust__logo')];
        const front = new Set(), back = new Set();
        const tick = () => {
          for (const el of marks) (+el.style.zIndex > 50 ? front : back).add(el.alt);
          if (front.size === marks.length && back.size === marks.length) return resolve({ front: front.size, back: back.size });
          requestAnimationFrame(tick);
        };
        tick();
        setTimeout(() => resolve({ front: front.size, back: back.size }), 28000);
      }));
      expect(seen).toEqual({ front: 5, back: 5 });

      // And they travel.
      await page.waitForTimeout(900);
      const after = await boxes();
      expect(after.some((b, i) => Math.abs(b.x - before[i].x) > 4 || Math.abs(b.y - before[i].y) > 4)).toBe(true);
    } else {
      // Narrow screens drop the orbit for a plain row under the claim.
      for (const b of await boxes()) {
        expect(b.y).toBeGreaterThan(t.y);
        expect(b.w).toBeGreaterThan(0);
      }
      const ys = (await boxes()).map(b => Math.round(b.y));
      expect(Math.max(...ys) - Math.min(...ys), 'the marks sit on one row').toBeLessThan(4);
    }
  });

  test('trusted-by orbit stops when it is off screen', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'the orbit only runs on wide screens');
    await open(page, '/', { galaxy: false });
    await page.locator('.trust').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0)); // hero: the orbit is far below
    const at = () => page.locator('.trust__logo').first().evaluate(el => el.style.transform);
    const before = await at();
    await page.waitForTimeout(700);
    expect(await at(), 'the orbit should idle while out of view').toBe(before);
  });

  test('trusted-by names are not claimed as customers in the schema', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const nodes = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
    const text = JSON.stringify(nodes);
    for (const lab of ['OpenAI', 'Anthropic', 'DeepMind', 'Mistral', 'xAI']) {
      expect(text, `${lab} should not appear in the structured data`).not.toContain(lab);
    }
  });

  test('faq opens one answer at a time', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const items = page.locator('.faq__item');
    const list = page.locator('.faq__list');
    const opened = i => expect.poll(async () => (await faqRow(page, i)).height).toBeGreaterThan(40);
    const shut = i => expect.poll(async () => (await faqRow(page, i)).open).toBe(false);

    await expect(items).toHaveCount(9);
    // Everything starts closed, so the list is only nine rows tall.
    await shut(0);
    const closedHeight = await list.evaluate(el => el.offsetHeight);
    expect(closedHeight).toBeLessThan(700);

    await items.nth(0).locator('.faq__q').click();
    await opened(0);
    await expect(items.nth(0)).toHaveClass(/is-open/);
    await expect(items.nth(0).locator('.faq__a')).toContainText('talent engine for operator data');
    await expect.poll(() => list.evaluate(el => el.offsetHeight)).toBeGreaterThan(closedHeight);
    // Chevron points up while open.
    await expect.poll(() => items.nth(0).locator('.faq__chevron').evaluate(el => getComputedStyle(el).transform))
      .toBe('matrix(-1, 0, 0, -1, 0, 0)');

    // Opening another closes the first.
    await items.nth(1).locator('.faq__q').click();
    await opened(1);
    await shut(0);

    // Clicking an open row closes it and the list returns to its compact height.
    await items.nth(1).locator('.faq__q').click();
    await shut(1);
    await expect.poll(() => list.evaluate(el => el.offsetHeight)).toBe(closedHeight);
  });

  test('faq survives a click before the open transition has moved', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const first = page.locator('.faq__item').first();
    // Open and close again immediately: no transition has run, so nothing fires transitionend.
    await first.locator('.faq__q').click();
    await first.locator('.faq__q').click();
    await expect.poll(async () => (await faqRow(page, 0)).open).toBe(false);
    // And it still opens afterwards.
    await first.locator('.faq__q').click();
    await expect.poll(async () => (await faqRow(page, 0)).height).toBeGreaterThan(40);
  });

  test('faq answers stay in the page source and take a deep link', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    // Closed answers are still in the DOM, which is what crawlers and assistants read.
    const answers = await page.locator('.faq__a').allTextContents();
    expect(answers).toHaveLength(9);
    for (const a of answers) expect(a.length).toBeGreaterThan(80);

    await page.goto('/#faq-3');
    await expect.poll(async () => (await faqRow(page, 2)).height).toBeGreaterThan(40);
    await expect(page.locator('#faq-3 .faq__a')).toContainText('head-mounted camera');
  });

  test('faq is keyboard operable', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    await page.locator('.faq__item').first().locator('.faq__q').focus();
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await faqRow(page, 0)).height).toBeGreaterThan(40);
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await faqRow(page, 0)).open).toBe(false);
  });

  test('nav blur only appears after the hero scrolls away', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const nav = page.locator('[data-nav]');
    const blur = page.locator('.nav__blur');
    await expect(nav).not.toHaveClass(/is-scrolled/);
    await expect(nav).toHaveCSS('position', 'fixed');
    expect(await blur.evaluate(el => getComputedStyle(el).backdropFilter)).toMatch(/blur\(0px\)|none/);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await expect(nav).toHaveClass(/is-scrolled/);
    await expect(blur).toHaveClass(/is-on/);
    await expect.poll(() => blur.evaluate(el => getComputedStyle(el).backdropFilter)).toBe('blur(4px)');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).not.toHaveClass(/is-scrolled/);
  });

  test('hero and galaxy move at different speeds (parallax)', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const h1 = page.locator('h1');
    const galaxy = page.locator('[data-galaxy-hero]');
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(async () => num(await h1.evaluate(el => el.style.transform))).toBe(-80);
    await expect.poll(async () => num(await galaxy.evaluate(el => el.style.transform))).toBe(248);
    const opacity = await h1.evaluate(el => parseFloat(el.style.opacity));
    expect(opacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThan(0);
    // Bottom to top: nav blur, galaxy, headline, nav links and button.
    await expect(page.locator('.nav__blur')).toHaveCSS('z-index', '40');
    await expect(galaxy).toHaveCSS('z-index', '60');
    await expect(page.locator('.hero')).toHaveCSS('z-index', '65');
    await expect(page.locator('[data-nav]')).toHaveCSS('z-index', '70');
    const navH = await page.locator('[data-nav]').evaluate(el => el.offsetHeight);
    expect(await page.locator('.nav__blur').evaluate(el => el.offsetHeight)).toBe(navH);
  });

  test('belief text unblurs word by word on scroll and the mark rotates', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const words = page.locator('[data-belief] [data-w]');
    expect(await words.count()).toBeGreaterThan(60);
    // Below the fold: dim and blurred.
    const first = words.first();
    await expect.poll(async () => num(await first.evaluate(el => el.style.opacity))).toBeCloseTo(0.14, 2);
    await expect.poll(async () => num(await first.evaluate(el => el.style.filter))).toBeCloseTo(6.3, 1);
    // Bring the first line into the focus band at the bottom of the viewport: half way there.
    const para = page.locator('[data-belief] p').first();
    await para.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - 84 - 36)));
    await expect.poll(async () => num(await first.evaluate(el => el.style.filter))).toBeLessThan(6.3);
    expect(num(await first.evaluate(el => el.style.filter))).toBeGreaterThan(0);
    const mid = num(await first.evaluate(el => el.style.opacity));
    expect(mid).toBeGreaterThan(0.14);
    expect(mid).toBeLessThan(1);
    // Lines further down the same paragraph are still fully soft.
    const lastWord = words.nth(await para.locator('[data-w]').count() - 1);
    expect(num(await lastWord.evaluate(el => el.style.opacity))).toBeCloseTo(0.14, 2);
    // Scroll the paragraph to the top of the viewport: sharp and fully visible.
    await para.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
    await expect.poll(async () => num(await first.evaluate(el => el.style.opacity))).toBe(1);
    await expect.poll(() => first.evaluate(el => el.style.filter)).toBe('none');
    const rot = await page.locator('[data-belief-mark]').evaluate(el => el.style.transform);
    expect(rot).toMatch(/^rotate\(\d+\.\d+deg\)$/);
    expect(parseFloat(rot.replace('rotate(', ''))).toBeGreaterThan(30);
  });

  test('sections reveal when scrolled into view and cards keep hover', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const card = page.locator('.card').first();
    await expect(card).not.toHaveClass(/is-in/);
    await expect(card).toHaveCSS('opacity', '0');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-in/);
    await expect(card).toHaveClass(/is-settled/, { timeout: 15000 });
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('transition-duration', '0.45s, 0.55s');
    await card.hover();
    await expect.poll(async () => alpha(await card.evaluate(el => getComputedStyle(el).backgroundColor))).toBeGreaterThan(0.02);
    await expect.poll(() => card.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, -6)');
    await expect.poll(async () => alpha(await card.locator('.card__media').evaluate(el => getComputedStyle(el).borderColor))).toBeCloseTo(0.22, 1);
  });

  test('buttons lift on hover and the star turns', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const btn = page.locator('header .btn');
    await expect(btn).toHaveCSS('border-radius', '4px');
    await expect(btn).toHaveCSS('font-family', /JetBrains Mono/);
    await btn.hover();
    await expect.poll(() => btn.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, -2)');
    await expect.poll(() => btn.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    const cta = page.locator('.cta .btn--lg');
    await cta.scrollIntoViewIfNeeded();
    await cta.hover();
    await expect.poll(() => cta.locator('.btn__star').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  });

  test('footer mark spins only while hovered', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const link = page.locator('.footer__mark a');
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveCSS('animation-play-state', 'paused');
    await expect(link).toHaveCSS('animation-duration', '14s');
    await link.hover();
    await expect(link).toHaveCSS('animation-play-state', 'running');
    await page.mouse.move(0, 0);
    await expect(link).toHaveCSS('animation-play-state', 'paused');
  });

  test('footer mark shows the definition while hovered', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const link = page.locator('.footer__mark a');
    const def = page.locator('.footer__mark .def');
    await link.scrollIntoViewIfNeeded();
    await expect(def).toHaveCSS('opacity', '0');
    await expect(def).toHaveCSS('pointer-events', 'none');
    await expect(link).toHaveAttribute('aria-describedby', 'zr-definition');
    await expect(def).toHaveAttribute('role', 'tooltip');
    await link.hover();
    await expect(link).toHaveCSS('animation-play-state', 'running');
    await expect.poll(async () => num(await def.evaluate(el => getComputedStyle(el).opacity))).toBe(1);
    await expect(def.locator('strong').first()).toHaveText('Zirconoid');
    await expect(def).toContainText('ˈzər-kə-ˌnȯid');
    await expect(def).toContainText('ditetragonal dipyramid');
    await expect(def.locator('.def__body strong')).toHaveText('We turn pressure into permanence.');
    await expect(def.locator('.def__body em')).toHaveText('Definition:');
    await page.mouse.move(0, 0);
    await expect.poll(async () => num(await def.evaluate(el => getComputedStyle(el).opacity))).toBe(0);
  });

  test('belief mark shows the same definition while hovered', async ({ page }) => {
    await open(page, '/', { galaxy: false });
    const wrap = page.locator('.belief__mark-wrap');
    const def = page.locator('.belief__mark-wrap .def');
    await wrap.scrollIntoViewIfNeeded();
    await expect(def).toHaveCSS('opacity', '0');
    await expect(wrap).toHaveAttribute('aria-describedby', 'zr-definition-top');
    await wrap.hover();
    await expect.poll(async () => num(await def.evaluate(el => getComputedStyle(el).opacity))).toBe(1);
    await expect(def).toContainText('ditetragonal dipyramid');
    // To the right of the mark on desktop, above it on phones; always inside the viewport.
    const [w, d] = await Promise.all([wrap.boundingBox(), def.boundingBox()]);
    if (page.viewportSize().width > 640) {
      expect(d.x).toBeGreaterThan(w.x + w.width);
      expect(Math.abs((d.y + d.height / 2) - (w.y + w.height / 2))).toBeLessThan(2);
    } else {
      expect(Math.round(d.x)).toBe(Math.round(w.x));
      expect(d.y + d.height).toBeLessThan(w.y);
    }
    expect(d.x + d.width).toBeLessThanOrEqual(page.viewportSize().width);
    expect(d.y).toBeGreaterThanOrEqual(0);
    // Hover does not spin this mark; its rotation follows scroll only.
    expect(await page.locator('[data-belief-mark]').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
    await page.mouse.move(0, 0);
    await expect.poll(async () => num(await def.evaluate(el => getComputedStyle(el).opacity))).toBe(0);
  });

  // 24 frames per galaxy before it shows, and software WebGL on CI runners takes seconds per frame.
  // The budget also covers browser context setup, which crawls right after a heavy WebGL page closes.
  test.describe('galaxy', () => {
    test.describe.configure({ timeout: 240_000 });

    test('galaxy renders in the hero and the footer', async ({ page }) => {
      const errors = watch(page);
      await open(page, '/');
      const gal = page.locator('zirconoid-galaxy');
      await expect(gal).toHaveCount(2);
      await expect(gal.first()).toHaveAttribute('mouse', '1');
      await expect(gal.nth(1)).toHaveAttribute('mouse', '0');
      await expect(gal.nth(1)).toHaveAttribute('rotation-speed', '0.18');
      await expect(gal.first().locator('canvas')).toHaveCount(1);
      await expect(gal.first()).toHaveAttribute('data-ready', '', { timeout: 120000 });
      await expect.poll(() => gal.first().locator('canvas').evaluate(el => getComputedStyle(el).opacity), { timeout: 60000 }).toBe('1');
      // The galaxy layer must never catch clicks.
      await expect(page.locator('[data-galaxy-hero]')).toHaveCSS('pointer-events', 'none');
      // The footer galaxy only starts rendering once it is near the viewport.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(gal.nth(1)).toHaveAttribute('data-ready', '', { timeout: 120000 });
      await expect.poll(() => gal.nth(1).locator('canvas').evaluate(el => getComputedStyle(el).opacity), { timeout: 60000 }).toBe('0.45');
      expect(errors.filter(e => !/WebGL|GPU|swiftshader/i.test(e))).toEqual([]);
    });

    test('galaxy code loads three.js from the vendored copy', async ({ page }) => {
      const urls = [];
      page.on('request', r => urls.push(r.url()));
      await open(page, '/');
      await expect(page.locator('zirconoid-galaxy').first()).toHaveAttribute('data-ready', '', { timeout: 120000 });
      expect(urls.some(u => u.endsWith('/assets/vendor/three.module.min.js'))).toBe(true);
      expect(urls.filter(u => /jsdelivr/.test(u))).toEqual([]);
    });
  });

  test('reduced motion shows everything at once', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await open(page, '/', { galaxy: false });
    const first = page.locator('[data-belief] [data-w]').first();
    await expect.poll(async () => num(await first.evaluate(el => el.style.opacity))).toBe(1);
    await expect(page.locator('.card').first()).toHaveClass(/is-in/);
    await expect(page.locator('.card').first()).toHaveCSS('opacity', '1');
    await ctx.close();
  });
});
