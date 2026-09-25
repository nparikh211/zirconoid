import { SITE, ORGANIZATION, ORG_ID, SITE_ID, WEBSITE, breadcrumbs } from '../site.js';
import { layout, ASSET_V } from '../layout.js';

const PATH = '/buy/';
const TITLE = 'Commercial data — Zirconoid';
const DESCRIPTION = 'Purchase a Train or Commercial license for Zirconoid operator-captured datasets. Stripe checkout opens once configured.';

/**
 * Obscured commercial purchase page. Reachable by URL only — never linked from
 * nav, footer, or the homepage. Kept out of the sitemap and llms files.
 * Legal pages /data-license/ and /terms-of-sale/ are linked from here only.
 */
export function render() {
  const v = file => `${file}?v=${ASSET_V[file]}`;
  const body = `
<main class="page buy-page">
  <div class="page__inner">
    <p class="eyebrow">Commercial</p>
    <h1 class="page__title">Buy commercial data access</h1>
    <p class="page__lede">Licensed operator-captured datasets for physical AI. Checkout opens once Stripe is configured. Effective [DATE], Version 1.0.</p>

    <section class="buy-panel" aria-labelledby="buy-panel-title" data-buy-panel>
      <h2 class="buy-panel__title" id="buy-panel-title">Commercial package</h2>
      <p class="buy-panel__lede">You are buying a <strong>license</strong>, not the raw dataset as a product you can resell. Pricing and package details will appear here when checkout is live.</p>
      <p class="buy-panel__status" data-buy-status role="status">Coming soon — Stripe not configured. A publishable key or Payment Link plus a server-side Checkout Session endpoint are required before charges can run.</p>

      <fieldset class="buy-sku">
        <legend class="buy-sku__legend">License SKU</legend>
        <label class="buy-sku__option">
          <input type="radio" name="license-sku" value="train" data-buy-sku checked>
          <span><strong>Train License</strong> — Best for most teams. Train and ship models. Dataset stays with you — not for resale as data.</span>
        </label>
        <label class="buy-sku__option">
          <input type="radio" name="license-sku" value="commercial" data-buy-sku>
          <span><strong>Commercial License</strong> — For teams that want written indemnity and broader seat/affiliate coverage on top of Train rights. See full license for details.</span>
        </label>
      </fieldset>

      <div class="buy-summary">
        <p class="buy-summary__lead"><strong>You are buying a license, not the raw dataset as a product you can resell.</strong></p>
        <ul class="buy-summary__list">
          <li><strong>Train License (default):</strong> Use this pack to develop, train, fine-tune, and evaluate AI/ML models. You own your models and may commercialize products powered by them. You may <strong>not</strong> redistribute, resell, or publicly host the dataset (or large extracts), or build a competing dataset from it.</li>
          <li><strong>Commercial License (if selected):</strong> Everything in Train, plus expanded team/affiliate seats (as shown on your order), clear rights to deploy models in third-party commercial products/services, and Zirconoid’s IP/consent indemnity for the dataset as delivered.</li>
          <li><strong>People in the footage:</strong> Capture is rights-cleared for licensed AI training uses. You get <strong>no</strong> right to identify, contact, or publish recognizable people from the data. No re-ID, no biometric identity systems, no targeted personal surveillance.</li>
          <li><strong>Payment &amp; access:</strong> License starts when payment clears and we deliver access. <strong>No refund after download or access</strong>, except if we delivered the wrong or broken files and cannot fix them.</li>
          <li><strong>B2B / 18+:</strong> Business purchases only. You must be 18+ and able to bind your organization.</li>
        </ul>
      </div>

      <label class="buy-agree">
        <input type="checkbox" data-buy-agree>
        <span>I am authorized to buy for my organization. I agree to Zirconoid’s <a href="../data-license/">Dataset License Agreement</a> and <a href="../terms-of-sale/">Online Terms of Sale</a> (Effective [DATE], Version 1.0). I understand this is a license to use the dataset for AI training — not a sale of the raw data — and that access is final once delivered.</span>
      </label>

      <button type="button" class="btn btn--lg" data-buy-checkout disabled aria-disabled="true">Coming soon / Stripe not configured</button>
      <p class="buy-panel__note">Static GitHub Pages cannot create Stripe Checkout Sessions. When ready, set keys in <code>assets/js/buy-config.js</code> and point <code>checkoutSessionEndpoint</code> at a Cloudflare Worker (or other serverless) that creates the Session server-side. Until then this button stays disabled and never charges a card.</p>

      <p class="buy-legal-strip">Legal: <a href="../data-license/">Dataset License Agreement</a> · <a href="../terms-of-sale/">Online Terms of Sale</a> · <a href="../terms/">Website Terms</a> · <a href="../privacy/">Privacy</a><br>Questions: <a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </section>

    <div class="legal buy-legal">
      <section id="license">
        <h2>Dataset License Agreement</h2>
        <p><strong>Effective [DATE], Version 1.0.</strong> A non-exclusive license to use the purchased dataset pack for AI/ML training and related model work under Train or Commercial SKU terms. You own your models and may commercialize them; you may not redistribute, resell, or publicly host the dataset or build a competing dataset from it. Capture is rights-cleared for licensed uses; no re-identification or biometric identity rights.</p>
        <p><a href="../data-license/">Read the full Dataset License Agreement</a></p>
      </section>
      <section id="terms">
        <h2>Online Terms of Sale</h2>
        <p><strong>Effective [DATE], Version 1.0.</strong> Purchase wrapper for dataset orders: Order Confirmation controls, B2B/18+ eligibility, payment before access, no refund after download/access (narrow defective-delivery cure), and Delaware governing law. The Dataset License Agreement is the main instrument; these Terms of Sale are the purchase wrapper.</p>
        <p><a href="../terms-of-sale/">Read the full Online Terms of Sale</a></p>
        <p>Site-wide website terms remain at <a href="../terms/">/terms/</a>; privacy at <a href="../privacy/">/privacy/</a>.</p>
      </section>
    </div>
  </div>
</main>`;

  const jsonLd = [
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'WebPage',
      '@id': `${SITE.origin}${PATH}#webpage`,
      url: SITE.origin + PATH,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      dateModified: SITE.updated,
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Buy', path: PATH }]),
  ];

  return layout({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    body,
    // Do not set current — keeps buy out of nav/footer aria-current and visual chrome.
    jsonLd,
    robots: 'noindex,nofollow',
    extraScripts: `\n<script src="../${v('assets/js/buy-config.js')}" defer></script>\n<script src="../${v('assets/js/buy.js')}" defer></script>`,
  });
}
