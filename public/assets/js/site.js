// Page behaviour: nav blur on scroll, hero parallax, belief text reveal, scroll-in reveals.
// Every effect degrades to static content when JS is off or motion is reduced.
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('[data-nav]');
  const blur = document.querySelector('[data-nav-blur]');
  const hero = document.querySelector('[data-hero-title]');
  const galaxy = document.querySelector('[data-galaxy-hero]');
  const mark = document.querySelector('[data-belief-mark]');
  const belief = document.querySelector('[data-belief]');

  // Split the belief paragraphs into words so each can blur and fade on its own.
  const words = [];
  if (belief) {
    belief.querySelectorAll('p').forEach(p => {
      const text = p.textContent.trim().split(/\s+/);
      p.textContent = '';
      text.forEach(w => {
        const s = document.createElement('span');
        s.setAttribute('data-w', '');
        s.textContent = w + ' ';
        p.appendChild(s);
        words.push(s);
      });
    });
  }

  const BLUR = 6.3, BAND = 72, FOCUS_OFFSET = 84;
  // A phone drives the scroll itself and hands the page a frame after the fact, so a big layer
  // moved from script trails the scroll and stutters. Leave the galaxy where it is there.
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  // Where each word sits in the page, measured once. Asking the browser for eighty boxes on
  // every scroll frame, in the same loop that writes their blur, makes it settle the styles it
  // has just been handed. Nothing here moves the words, so measure once and do arithmetic.
  let tops = [], last = [], heroTop = 0;
  const pageTop = el => { let t = 0; for (let n = el; n; n = n.offsetParent) t += n.offsetTop; return t; };
  function measure() {
    const y = window.scrollY || 0;
    tops = words.map(el => el.getBoundingClientRect().top + y);
    last = words.map(() => NaN);
    if (hero) heroTop = pageTop(hero);     // offsetTop ignores the hero's own parallax
  }

  let raf = 0;
  function update() {
    raf = 0;
    const y = window.scrollY || 0, vh = window.innerHeight || 800;
    if (galaxy && !reduce && !coarse) galaxy.style.transform = `translateY(${(y * 0.62).toFixed(1)}px)`;
    const shift = hero && !reduce ? -y * 0.2 : 0;
    if (nav && blur && !nav.classList.contains('nav--sticky')) {
      const on = hero ? heroTop - y + shift < 90 : y > vh * 0.3;
      nav.classList.toggle('is-scrolled', on);
      blur.classList.toggle('is-on', on);
    }
    if (hero && !reduce) {
      hero.style.transform = `translateY(${shift.toFixed(1)}px)`;
      hero.style.opacity = Math.max(0, 1 - y / (vh * 0.9)).toFixed(3);
    }
    if (mark && !reduce) mark.style.transform = `rotate(${(y * 0.06).toFixed(2)}deg)`;
    const focus = y + vh - FOCUS_OFFSET;
    for (let i = 0; i < words.length; i++) {
      const t = reduce ? 1 : Math.max(0, Math.min(1, (focus - tops[i]) / BAND));
      // Round to a hundredth: a word that has settled then writes nothing at all, so most
      // frames touch only the handful of words actually crossing the focus line.
      const q = Math.round(t * 100) / 100;
      if (q === last[i]) continue;
      last[i] = q;
      const el = words[i];
      el.style.filter = q >= 1 ? 'none' : `blur(${((1 - q) * BLUR).toFixed(2)}px)`;
      el.style.opacity = (0.14 + 0.86 * q).toFixed(3);
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  // Measuring costs a layout, so never more than once a frame: a phone fires resize repeatedly
  // as the address bar slides away.
  let mraf = 0;
  function remeasure() { if (!mraf) mraf = requestAnimationFrame(() => { mraf = 0; measure(); update(); }); }
  // Keep the blur strip the same height as the nav.
  if (nav && blur) {
    const fit = () => document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(nav); else window.addEventListener('resize', fit);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  measure();
  update();

  // Scroll-in reveals. Once an element has faded in it goes back to its own hover transitions.
  const targets = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in', 'is-settled'));
  } else {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        setTimeout(() => e.target.classList.add('is-settled'), 950);
        io.unobserve(e.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  // The Zirconoid marks show their definition on hover. A touch screen has no hover, and the
  // footer mark is also a link home, so a tap there would just jump to the top of the page.
  // On those devices a tap shows the definition instead, and a tap anywhere else puts it away.
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
    const holders = [document.querySelector('.belief__mark-wrap'), document.querySelector('.footer__mark')].filter(Boolean);
    for (const holder of holders) {
      holder.addEventListener('click', e => {
        e.preventDefault();                       // never follow the link on a tap
        const wasOpen = holder.classList.contains('is-open');
        for (const other of holders) other.classList.remove('is-open');
        if (!wasOpen) holder.classList.add('is-open');
      });
    }
    if (holders.length) {
      document.addEventListener('click', e => {
        if (holders.some(h => h.contains(e.target))) return;
        for (const h of holders) h.classList.remove('is-open');
      });
    }
  }

  // Trusted-by sphere. The marks sit on a sphere centred on the claim and the sphere turns,
  // so each one swings out to the sides and slides back behind the words in between.
  const orbit = document.querySelector('[data-orbit]');
  const logos = orbit ? [...orbit.querySelectorAll('.trust__logo')] : [];
  if (logos.length) {
    const PERIOD = 22600;   // ms for one full turn
    const TILT = 0.20;      // radians the sphere leans towards the viewer. Kept shallow so marks
                            // cross the line of text rather than arcing clear of it.
    const FOCAL = 3.2;      // smaller pulls the perspective harder
    const DIM = 0.18;       // opacity at the very back
    const LIT = 0.95;       // opacity at the very front
    const TITLE_LAYER = 50; // must match .trust__title's z-index

    // Evenly spaced around the upright axis, at stepped latitudes. A Fibonacci spread suits a
    // crowd, but with five marks its uneven azimuths let two bunch up. These latitudes came from
    // searching arrangements for the widest worst-case gap over a full turn.
    const LATITUDES = [0.66, -0.33, 0, 0.33, -0.66];
    const seeds = logos.map((_, i) => {
      const y = LATITUDES[i % LATITUDES.length];
      const ring = Math.sqrt(1 - y * y);
      const az = (i / logos.length) * Math.PI * 2;
      return [Math.cos(az) * ring, y, Math.sin(az) * ring];
    });

    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    const NEAR_P = FOCAL / (FOCAL - 1), FAR_P = FOCAL / (FOCAL + 1);

    // Spin a seed about the upright axis, lean the sphere towards the viewer, then project.
    // Returns offsets in units of the sphere radius, plus the perspective factor.
    const project = ([sx, sy, sz], cosA, sinA) => {
      const x = sx * cosA + sz * sinA;
      const spun = sz * cosA - sx * sinA;
      const y = sy * cosT - spun * sinT;
      const z = sy * sinT + spun * cosT;       // -1 at the back, 1 at the front
      const p = FOCAL / (FOCAL - z);           // near marks grow
      return { x: x * p, y: y * p, p, z };
    };

    // The widest and tallest the sphere ever gets over a full turn, in units of radius.
    // Measuring it beats a worst-case guess, which would leave the sphere far too small.
    let spanX = 0, spanY = 0;
    for (let k = 0; k < 180; k++) {
      const turn = (k / 180) * Math.PI * 2;
      const cosA = Math.cos(turn), sinA = Math.sin(turn);
      for (const seed of seeds) {
        const { x, y } = project(seed, cosA, sinA);
        spanX = Math.max(spanX, Math.abs(x));
        spanY = Math.max(spanY, Math.abs(y));
      }
    }

    let radius = 0, spinning = false, startedAt = 0, elapsed = 0, raf = 0;

    const measure = () => {
      if (getComputedStyle(orbit).display === 'flex') { radius = 0; return; } // narrow-screen row
      const pad = (logos[0].clientWidth || 40) * NEAR_P / 2 + 8;   // half a mark at its largest
      radius = Math.min((orbit.clientWidth / 2 - pad) / spanX, (orbit.clientHeight / 2 - pad) / spanY);
    };

    const place = ms => {
      if (!radius) return;                     // stacked: CSS owns the layout
      const turn = (ms / PERIOD) * Math.PI * 2;
      const cosA = Math.cos(turn), sinA = Math.sin(turn);
      logos.forEach((el, i) => {
        const { x, y, p, z } = project(seeds[i], cosA, sinA);
        const near = (p - FAR_P) / (NEAR_P - FAR_P);
        el.style.transform = `translate3d(${(x * radius).toFixed(1)}px, ${(y * radius).toFixed(1)}px, 0) scale(${p.toFixed(3)})`;
        el.style.opacity = (DIM + (LIT - DIM) * near).toFixed(3);
        // The claim hangs in the middle of the sphere, on TITLE_LAYER. A mark on the near side
        // passes over the words, one on the far side goes behind them, and among themselves the
        // nearer always covers the farther.
        el.style.zIndex = z > 0
          ? TITLE_LAYER + 1 + Math.round(z * 48)
          : 1 + Math.round((z + 1) * 48);
      });
    };

    const frame = now => {
      if (!spinning) return;
      place(elapsed + (now - startedAt));
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (spinning || reduce || !radius) return;
      spinning = true;
      startedAt = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const halt = () => {
      if (!spinning) return;
      elapsed += performance.now() - startedAt;
      spinning = false;
      cancelAnimationFrame(raf);
    };

    measure();
    place(elapsed);
    window.addEventListener('resize', () => { const was = spinning; halt(); measure(); place(elapsed); if (was) run(); });
    // Only animate while the section is on screen, and never in a hidden tab.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { es[0].isIntersecting && !document.hidden ? run() : halt(); }, { rootMargin: '120px' }).observe(orbit);
    } else { run(); }
    document.addEventListener('visibilitychange', () => { if (document.hidden) halt(); });
  }

  // FAQ accordion: one answer open at a time, with a height transition.
  // The <details> elements carry the behaviour on their own when this never runs.
  const faq = [...document.querySelectorAll('[data-faq] > details')];
  for (const item of faq) {
    // Browsers with exclusive <details> would slam siblings shut and cut the animation short.
    item.removeAttribute('name');
    const panel = item.querySelector('.faq__panel');

    let cleanup = null;
    const settle = () => { if (cleanup) { cleanup(); cleanup = null; } };

    const collapse = () => {
      if (!item.open) return;
      settle();
      item.classList.remove('is-open');
      if (reduce) { item.open = false; return; }
      // Hide the element once it has finished shrinking. The timer matters: closing a row
      // whose opening transition has not moved yet changes no value, so no transitionend comes.
      const finish = () => { settle(); if (!item.classList.contains('is-open')) item.open = false; };
      const onEnd = e => { if (e.target === panel) finish(); };
      const timer = setTimeout(finish, 420);
      panel.addEventListener('transitionend', onEnd);
      cleanup = () => { clearTimeout(timer); panel.removeEventListener('transitionend', onEnd); };
    };

    const expand = () => {
      settle();
      item.open = true;
      if (reduce) return item.classList.add('is-open');
      // Two frames: the panel has to be laid out at 0fr before the transition can start.
      requestAnimationFrame(() => requestAnimationFrame(() => { if (item.open) item.classList.add('is-open'); }));
    };

    item.querySelector('summary').addEventListener('click', e => {
      e.preventDefault();
      const open = item.classList.contains('is-open');
      for (const other of faq) if (other !== item) other._zrCollapse();
      open ? collapse() : expand();
    });

    item._zrCollapse = collapse;
    item._zrExpand = expand;
  }

  // A link to /#faq-3 opens that answer and scrolls to it.
  const openFromHash = () => {
    if (!/^#faq-\d+$/.test(location.hash)) return;
    const item = document.querySelector(location.hash);
    if (!item || !faq.includes(item)) return;
    for (const other of faq) if (other !== item) other._zrCollapse();
    item._zrExpand();
    item.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  };
  if (faq.length) {
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }
})();
