(() => {
  const panel = document.querySelector('[data-buy-panel]');
  if (!panel) return;

  const agree = panel.querySelector('[data-buy-agree]');
  const btn = panel.querySelector('[data-buy-checkout]');
  const status = panel.querySelector('[data-buy-status]');
  const cfg = window.ZIRCONOID_BUY || {};

  const configured = Boolean(
    (cfg.paymentLinkUrl && String(cfg.paymentLinkUrl).trim())
    || (cfg.checkoutSessionEndpoint && String(cfg.checkoutSessionEndpoint).trim()),
  );

  function label() {
    if (!configured) return 'Coming soon / Stripe not configured';
    if (!agree.checked) return 'Please confirm you agree to the Dataset License and Terms of Sale to continue.';
    return 'Continue to checkout';
  }

  function refresh() {
    const ready = configured && agree.checked;
    btn.disabled = !ready;
    btn.setAttribute('aria-disabled', ready ? 'false' : 'true');
    btn.textContent = label();
    if (status) {
      status.textContent = configured
        ? 'Stripe is configured. Agree to the Dataset License and Terms of Sale, then continue to checkout.'
        : 'Coming soon — Stripe not configured. A publishable key or Payment Link plus a server-side Checkout Session endpoint are required before charges can run.';
    }
  }

  agree.addEventListener('change', refresh);

  btn.addEventListener('click', async () => {
    if (btn.disabled || !agree.checked) {
      if (configured && !agree.checked && status) {
        status.textContent = 'Please confirm you agree to the Dataset License and Terms of Sale to continue.';
      }
      return;
    }
    const skuEl = panel.querySelector('[data-buy-sku]:checked');
    const sku = skuEl ? skuEl.value : 'train';
    if (cfg.checkoutSessionEndpoint) {
      btn.disabled = true;
      btn.textContent = 'Starting checkout…';
      try {
        const res = await fetch(cfg.checkoutSessionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ agree: true, product: cfg.productLabel || '', licenseSku: sku }),
        });
        if (!res.ok) throw new Error('Checkout session request failed');
        const data = await res.json();
        if (!data || !data.url) throw new Error('No checkout URL returned');
        window.location.href = data.url;
        return;
      } catch (err) {
        console.error(err);
        btn.textContent = 'Checkout unavailable — try again later';
        btn.disabled = false;
        return;
      }
    }
    if (cfg.paymentLinkUrl) {
      window.location.href = cfg.paymentLinkUrl;
      return;
    }
    refresh();
  });

  refresh();
})();
