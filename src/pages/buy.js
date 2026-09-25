import { SITE, ORGANIZATION, ORG_ID, SITE_ID, WEBSITE, breadcrumbs } from '../site.js';
import { layout, ASSET_V } from '../layout.js';

const PATH = '/buy/';
const TITLE = 'Commercial data — Zirconoid';
const DESCRIPTION = 'Purchase commercial access to Zirconoid operator-captured datasets. Stripe checkout and license text landing soon.';

/**
 * Obscured commercial purchase page. Reachable by URL only — never linked from
 * nav, footer, or the homepage. Kept out of the sitemap and llms files.
 */
export function render() {
  const v = file => `${file}?v=${ASSET_V[file]}`;
  const body = `
<main class="page buy-page">
  <div class="page__inner">
    <p class="eyebrow">Commercial</p>
    <h1 class="page__title">Buy commercial data access</h1>
    <p class="page__lede">Licensed operator-captured datasets for physical AI. Checkout opens once Stripe and the Commercial Data License are in place.</p>

    <section class="buy-panel" aria-labelledby="buy-panel-title" data-buy-panel>
      <h2 class="buy-panel__title" id="buy-panel-title">Commercial package</h2>
      <p class="buy-panel__lede">Scoped commercial license for evaluation and production use under the terms below. Pricing and package details will appear here when checkout is live.</p>
      <p class="buy-panel__status" data-buy-status role="status">Coming soon — Stripe not configured. A publishable key or Payment Link plus a server-side Checkout Session endpoint are required before charges can run.</p>

      <label class="buy-agree">
        <input type="checkbox" data-buy-agree>
        <span>I agree to the <a href="#license">Commercial Data License</a> and <a href="#terms">Terms</a></span>
      </label>

      <button type="button" class="btn btn--lg" data-buy-checkout disabled aria-disabled="true">Coming soon / Stripe not configured</button>
      <p class="buy-panel__note">Static GitHub Pages cannot create Stripe Checkout Sessions. When ready, set keys in <code>assets/js/buy-config.js</code> and point <code>checkoutSessionEndpoint</code> at a Cloudflare Worker (or other serverless) that creates the Session server-side. Until then this button stays disabled and never charges a card.</p>
    </section>

    <div class="legal buy-legal">
      <section id="license">
        <h2>Commercial Data License</h2>
        <p><strong>Draft pending.</strong> Commercial Counsel will supply the license text. Until then this section is a placeholder. The working stub lives at <code>docs/DATA_LICENSE.md</code> in the site repository.</p>
        <p>Expected topics: grant of rights, permitted uses (training / evaluation / production), restrictions, attribution, confidentiality of sample and production data, fees, termination, and governing law.</p>
        <p>Contact <a href="mailto:${SITE.email}">${SITE.email}</a> for commercial inquiries while this draft is incomplete.</p>
      </section>
      <section id="terms">
        <h2>Commercial terms</h2>
        <p><strong>Draft pending.</strong> Commercial Counsel will supply click-through terms for purchase. Site-wide terms of service remain at <a href="../terms/">/terms/</a>; this section will cover purchase-specific conditions (refunds, delivery, support, and warranty limits) once counsel delivers them.</p>
        <p>By checking the agreement box above you acknowledge that final license and terms text will bind the purchase when counsel publishes it here.</p>
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
