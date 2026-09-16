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
  let raf = 0;
  function update() {
    raf = 0;
    const y = window.scrollY || 0, vh = window.innerHeight || 800;
    if (galaxy && !reduce) galaxy.style.transform = `translateY(${(y * 0.62).toFixed(1)}px)`;
    if (nav && blur && !nav.classList.contains('nav--sticky')) {
      const on = hero ? hero.getBoundingClientRect().top < 90 : y > vh * 0.3;
      nav.classList.toggle('is-scrolled', on);
      blur.classList.toggle('is-on', on);
    }
    if (hero && !reduce) {
      hero.style.transform = `translateY(${(-y * 0.2).toFixed(1)}px)`;
      hero.style.opacity = Math.max(0, 1 - y / (vh * 0.9)).toFixed(3);
    }
    if (mark && !reduce) mark.style.transform = `rotate(${(y * 0.06).toFixed(2)}deg)`;
    const focus = vh - FOCUS_OFFSET;
    for (const el of words) {
      const top = el.getBoundingClientRect().top;
      const t = reduce ? 1 : Math.max(0, Math.min(1, (focus - top) / BAND));
      el.style.filter = t >= 1 ? 'none' : `blur(${((1 - t) * BLUR).toFixed(2)}px)`;
      el.style.opacity = (0.14 + 0.86 * t).toFixed(3);
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  // Keep the blur strip the same height as the nav.
  if (nav && blur) {
    const fit = () => document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(nav); else window.addEventListener('resize', fit);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
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
