// Sample-request modal: open from [data-sample-open], submit via FormSubmit AJAX.
(() => {
  const sampleModal = document.querySelector('[data-sample-modal]');
  if (!sampleModal) return;

  const panel = sampleModal.querySelector('[data-sample-panel]');
  const form = sampleModal.querySelector('[data-sample-form]');
  const formWrap = sampleModal.querySelector('[data-sample-form-wrap]');
  const thanks = sampleModal.querySelector('[data-sample-thanks]');
  const errEl = sampleModal.querySelector('[data-sample-error]');
  const submitBtn = sampleModal.querySelector('[data-sample-submit]');
  const FORM_URL = 'https://formsubmit.co/ajax/data@zirconoid.com';
  let lastFocus = null;
  let pending = false;

  const focusables = () => [...panel.querySelectorAll(
    'button:not([disabled]), input:not([disabled]):not([type="hidden"]):not(.sample-form__hp), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  )].filter(el => el.offsetParent !== null);

  const showError = msg => {
    if (!errEl) return;
    errEl.hidden = !msg;
    errEl.textContent = msg || '';
  };

  const resetView = () => {
    if (formWrap) formWrap.hidden = false;
    if (thanks) thanks.hidden = true;
    showError('');
    if (form) form.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
    pending = false;
  };

  const open = () => {
    lastFocus = document.activeElement;
    resetView();
    sampleModal.hidden = false;
    document.documentElement.classList.add('sample-modal-open');
    const autofocus = sampleModal.querySelector('[data-sample-autofocus]');
    (autofocus || focusables()[0] || panel).focus();
  };

  const close = () => {
    if (pending) return;
    sampleModal.hidden = true;
    document.documentElement.classList.remove('sample-modal-open');
    resetView();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  };

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-sample-open]');
    if (opener) {
      e.preventDefault();
      open();
      return;
    }
    if (e.target.closest('[data-sample-close]') && sampleModal.contains(e.target)) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (sampleModal.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const nodes = focusables();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (pending) return;

    const fd = new FormData(form);
    const gotcha = (fd.get('_gotcha') || '').toString().trim();
    if (gotcha) {
      formWrap.hidden = true;
      thanks.hidden = false;
      (thanks.querySelector('button') || panel).focus();
      return;
    }

    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const company = (fd.get('company') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    if (!name || !email || !message) {
      showError('Please fill in name, work email, and what you need.');
      return;
    }

    pending = true;
    showError('');
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');

    const body = {
      name,
      email,
      company,
      message,
      _subject: 'Sample dataset request — zirconoid.com',
    };

    try {
      const res = await fetch(FORM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('bad status');
      formWrap.hidden = true;
      thanks.hidden = false;
      pending = false;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      (thanks.querySelector('button') || panel).focus();
    } catch (_) {
      pending = false;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      showError('Something went wrong. Please try again or email data@zirconoid.com.');
    }
  });
})();
