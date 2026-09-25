/**
 * Public Stripe / checkout config for /buy/.
 *
 * Fill these when Commercial Counsel and Stripe are ready. One file change is enough
 * for the client; a backend must still create Checkout Sessions (never from the browser
 * alone with a secret key).
 *
 * Options once configured:
 *   1. paymentLinkUrl — Stripe Payment Link (works from static GitHub Pages).
 *   2. checkoutSessionEndpoint — URL of a Worker/serverless that POSTs back { url }
 *      for a Checkout Session (preferred for custom line items).
 *
 * Leave keys empty to keep the CTA disabled ("Coming soon / Stripe not configured").
 */
window.ZIRCONOID_BUY = {
  // Stripe publishable key only (pk_test_… / pk_live_…). Never put a secret key here.
  publishableKey: '',
  // Optional: direct Payment Link. Used when checkoutSessionEndpoint is empty.
  paymentLinkUrl: '',
  // Optional: POST endpoint that creates a Checkout Session and returns { url }.
  checkoutSessionEndpoint: '',
  // Product label shown in future UI; not sent to Stripe until wired.
  productLabel: 'Zirconoid commercial data access',
};
