import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SITE, STAR } from './site.js';

// RB2B Forever Free visitor ID (company-level). Key from app.rb2b.com for zirconoid.com.
const RB2B = `<script>!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("DNXY8HJ8VDO0");</script>`;

// Short content hash per asset, appended as ?v=, so a CDN can never pair new HTML with a stale file.
const hash = file => createHash('sha256').update(readFileSync(new URL(`../public/${file}`, import.meta.url))).digest('hex').slice(0, 10);
export const ASSET_V = Object.fromEntries(
  ['assets/css/fonts.css', 'assets/css/site.css', 'assets/js/site.js', 'assets/js/galaxy.js', 'assets/js/paper.js'].map(f => [f, hash(f)]));
const v = file => `${file}?v=${ASSET_V[file]}`;

// Relative prefix from a page path back to the site root, so pages work at any base URL.
export const relRoot = path => '../'.repeat(path.split('/').filter(Boolean).length) || './';

function nav({ rel, current, home }) {
  // The blur is a sibling below the galaxy layer, so it softens page content but never the galaxy.
  // The nav itself sits above the galaxy so links and the button always stay readable.
  return `
<div class="nav__blur${home ? '' : ' nav__blur--on'}" data-nav-blur aria-hidden="true"></div>
<header class="nav${home ? '' : ' nav--sticky'}" data-nav>
  <a class="nav__brand" href="${rel}">Zirconoid</a>
  <nav class="nav__links" aria-label="Primary">
    <a class="nav__link" href="${rel}blog/"${current === 'blog' ? ' aria-current="page"' : ''}>Blog</a>
    <button type="button" class="btn" data-sample-open>${STAR}Request a sample</button>
  </nav>
</header>`;
}

function footerLinks(rel, current) {
  const cur = k => (current === k ? ' aria-current="page"' : '');
  return `
      <a href="${rel}blog/"${cur('blog')}>Blog</a>
      <a href="${rel}privacy/"${cur('privacy')}>Privacy</a>
      <a href="${rel}terms/"${cur('terms')}>Terms</a>`;
}

// The Zirconoid definition, shown as a tooltip on the marks. `align` is where the caret sits: center or left.
export function definitionBubble(id, align) {
  return `<div class="def def--${align}" id="${id}" role="tooltip">
      <p class="def__head"><strong>Zirconoid</strong> <span class="def__pos">(noun)</span> <span class="def__pron">\\ ˈzər-kə-ˌnȯid \\</span></p>
      <p class="def__body"><em>Definition:</em> An architectural archetype engineered for absolute endurance and multifaceted clarity. Modeled after the geometric precision of the ditetragonal dipyramid, Zirconoid defines a new class of business—one that collects precise human intelligence to help create multifaceted breakthroughs in our lifetime. <strong>We turn pressure into permanence.</strong></p>
    </div>`;
}

export function homeFooter({ rel }) {
  return `
<footer class="footer">
  <div class="footer__clip" aria-hidden="true">
    <div class="footer__galaxy">
      <zirconoid-galaxy core="#f2f2ee" accent="#b9b9b3" outer="#5c5c58" particle-size="0.6" rotation-speed="0.18" mouse="0" camera="0,-2.6,5.4" offset="0,0,0" dim="0.45"></zirconoid-galaxy>
      <div class="footer__vignette"></div>
      <div class="footer__fade-top"></div>
      <div class="footer__fade-bottom"></div>
    </div>
  </div>
  <div class="footer__mark" tabindex="0" aria-label="Zirconoid mark" aria-describedby="zr-definition">
    <img src="${rel}assets/img/mark.svg" alt="" width="56" height="56">
    ${definitionBubble('zr-definition', 'center')}
  </div>
  <div class="footer__bar">
    <span>${SITE.copyright}</span>
    <nav aria-label="Footer">${footerLinks(rel)}
      <a href="mailto:${SITE.email}">Contact</a>
    </nav>
  </div>
</footer>`;
}

export function simpleFooter({ rel, current }) {
  return `
<footer class="footer footer--simple">
  <div class="footer__inner">
    <div class="footer__brand">
      <img src="${rel}assets/img/mark.svg" alt="Zirconoid" width="26" height="26">
      <span>${SITE.copyright}</span>
    </div>
    <nav aria-label="Footer">${footerLinks(rel, current)}
      <a href="mailto:${SITE.email}">${SITE.email}</a>
    </nav>
  </div>
</footer>`;
}

/**
 * Wrap page content in the document shell.
 * @param {object} o
 * @param {string} o.path        site-relative path, e.g. "/blog/"
 * @param {string} o.title       <title>
 * @param {string} o.description meta description
 * @param {string} o.body        inner HTML for <main> and any sections
 * @param {boolean} [o.home]     home page gets the fixed nav and the galaxy footer
 * @param {string} [o.current]   which nav item is current
 * @param {string} [o.jsonLd]    optional JSON-LD block
 * @param {string} [o.ogType]
 * @param {string} [o.robots]    robots directives; pass "noindex,follow" to keep a page out of search
 * @param {string} [o.published] ISO date for article metadata
 * @param {string} [o.modified]  ISO date of the last meaningful edit
 * @param {boolean} [o.paper]    blog pages sit on a paper sheet: light palette, dark nav scrim
 * @param {string} [o.rel]       prefix for asset and nav links; defaults to a relative path back to the root
 */
export function layout({
  path, title, description, body,
  home = false, paper = false, current = '', jsonLd = '', ogType = 'website', rel = relRoot(path),
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  published = '', modified = SITE.updated, extraHead = '',
}) {
  const canonical = SITE.origin + path;
  // Several nodes per page go in one @graph so they can reference each other by @id.
  const ld = Array.isArray(jsonLd) ? JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd }) : jsonLd;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta name="googlebot" content="${robots}">
<meta name="theme-color" content="#141414">
<meta name="author" content="${SITE.legalName}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.origin}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The Zirconoid mark">
<meta property="og:locale" content="en_US">${published ? `\n<meta property="article:published_time" content="${published}">\n<meta property="article:modified_time" content="${modified}">\n<meta property="article:publisher" content="${SITE.origin}/">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE.origin}/assets/img/og.jpg">
<link rel="icon" href="${rel}assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${rel}assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${rel}assets/img/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Zirconoid blog" href="${SITE.origin}/feed.xml">
<link rel="sitemap" type="application/xml" href="${SITE.origin}/sitemap.xml">
<link rel="preload" href="${rel}assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/ibm-plex-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}${v('assets/css/fonts.css')}">
<link rel="stylesheet" href="${rel}${v('assets/css/site.css')}">
<script>document.documentElement.classList.add('js')</script>${ld ? `\n<script type="application/ld+json">${ld}</script>` : ''}${extraHead}${RB2B}
</head>
<body>
<div class="site${home ? '' : ' site--column'}${paper ? ' site--paper' : ''}">
${nav({ rel, current, home })}
${body}
${home ? homeFooter({ rel }) : simpleFooter({ rel, current })}

<div class="sample-modal" data-sample-modal id="sample-dialog" hidden>
  <div class="sample-modal__backdrop" data-sample-close tabindex="-1" aria-hidden="true"></div>
  <div class="sample-modal__panel" role="dialog" aria-modal="true" aria-labelledby="sample-dialog-title" data-sample-panel tabindex="-1">
    <button type="button" class="sample-modal__x" data-sample-close aria-label="Close">&times;</button>
    <div data-sample-form-wrap>
      <h2 class="sample-modal__title" id="sample-dialog-title">Request a sample dataset</h2>
      <p class="sample-modal__lede">Tell us the domain, modality, and volume you need. We will return a scoped sample and a capture plan.</p>
      <form class="sample-form" data-sample-form action="https://formsubmit.co/ajax/${SITE.email}" method="POST" novalidate>
        <input type="hidden" name="_subject" value="Sample dataset request — zirconoid.com">
        <input type="text" name="_gotcha" class="sample-form__hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="sample-form__field">
          <span class="sample-form__label">Name <abbr title="required">*</abbr></span>
          <input type="text" name="name" required autocomplete="name" data-sample-autofocus>
        </label>
        <label class="sample-form__field">
          <span class="sample-form__label">Work email <abbr title="required">*</abbr></span>
          <input type="email" name="email" required autocomplete="email" inputmode="email">
        </label>
        <label class="sample-form__field">
          <span class="sample-form__label">Company <span class="sample-form__opt">(optional)</span></span>
          <input type="text" name="company" autocomplete="organization">
        </label>
        <label class="sample-form__field">
          <span class="sample-form__label">What you need <abbr title="required">*</abbr></span>
          <textarea name="message" required rows="4" placeholder="Domain, modality, and volume"></textarea>
        </label>
        <p class="sample-form__error" data-sample-error hidden role="alert"></p>
        <button type="submit" class="btn" data-sample-submit>${STAR}Request a sample</button>
      </form>
    </div>
    <div class="sample-modal__thanks" data-sample-thanks hidden>
      <p class="sample-modal__thanks-copy">Thank you, and we'll get back to you within a few hours.</p>
      <button type="button" class="btn" data-sample-close>Close</button>
    </div>
  </div>
</div>
</div>
<script src="${rel}${v('assets/js/site.js')}" defer></script>${home ? `\n<script type="module" src="${rel}${v('assets/js/galaxy.js')}"></script>` : ''}${paper ? `\n<script type="module" src="${rel}${v('assets/js/paper.js')}"></script>` : ''}
</body>
</html>
`;
}
