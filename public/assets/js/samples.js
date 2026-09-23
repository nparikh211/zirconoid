// Sample Datasets video lightbox
(() => {
  const box = document.querySelector('[data-video-lightbox]');
  if (!box) return;

  const panel = box.querySelector('[data-video-panel]');
  const player = box.querySelector('[data-video-player]');
  const titleEl = box.querySelector('[data-video-title]');
  let lastFocus = null;

  const root = () => {
    const a = document.querySelector('.nav__brand');
    if (!a) return '../';
    const href = a.getAttribute('href') || '../';
    return href.endsWith('/') ? href : href + '/';
  };

  const open = card => {
    lastFocus = document.activeElement;
    const file = card.getAttribute('data-video');
    const title = card.getAttribute('data-title') || '';
    const poster = card.getAttribute('data-poster') || '';
    const orient = card.getAttribute('data-orientation') || 'portrait';
    titleEl.textContent = title;
    panel.dataset.orientation = orient;
    player.dataset.orientation = orient;
    player.poster = poster ? `${root()}assets/img/samples/${poster}?v=3` : '';
    player.src = `${root()}assets/video/samples/${file}?v=3`;
    box.hidden = false;
    document.documentElement.classList.add('video-lightbox-open');
    panel.focus();
    player.play().catch(() => {});
  };

  const close = () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    box.hidden = true;
    document.documentElement.classList.remove('video-lightbox-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  };

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-sample-card]');
    if (card) {
      e.preventDefault();
      open(card);
      return;
    }
    if (e.target.closest('[data-video-close]') && box.contains(e.target)) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest?.('[data-sample-card]');
      if (card && document.activeElement === card) {
        e.preventDefault();
        open(card);
        return;
      }
    }
    if (box.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });
})();
