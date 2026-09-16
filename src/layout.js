import { SITE, STAR } from './site.js';

// Relative prefix from a page path back to the site root, so pages work at any base URL.
export const relRoot = path => '../'.repeat(path.split('/').filter(Boolean).length) || './';

function nav({ rel, current, home }) {
  return `
<header class="nav${home ? '' : ' nav--sticky'}" data-nav>
  <div class="nav__blur" aria-hidden="true"></div>
  <a class="nav__brand" href="${rel}">Zirconoid</a>
  <nav class="nav__links" aria-label="Primary">
    <a class="nav__link" href="${rel}blog/"${current === 'blog' ? ' aria-current="page"' : ''}>Blog</a>
    <a class="btn" href="${SITE.sampleMailto}">${STAR}Request a sample</a>
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

export function homeFooter({ rel }) {
  return `
<footer class="footer">
  <div class="footer__galaxy" aria-hidden="true">
    <zirconoid-galaxy core="#f2f2ee" accent="#b9b9b3" outer="#5c5c58" particle-size="0.6" rotation-speed="0.18" mouse="0" camera="0,-2.6,5.4" offset="0,0,0" dim="0.45"></zirconoid-galaxy>
    <div class="footer__vignette"></div>
    <div class="footer__fade-top"></div>
    <div class="footer__fade-bottom"></div>
  </div>
  <div class="footer__mark">
    <a href="${rel}" aria-label="Zirconoid"><img src="${rel}assets/img/mark.svg" alt="" width="56" height="56"></a>
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
 * @param {string} [o.rel]       prefix for asset and nav links; defaults to a relative path back to the root
 */
export function layout({ path, title, description, body, home = false, current = '', jsonLd = '', ogType = 'website', rel = relRoot(path) }) {
  const canonical = SITE.origin + path;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#141414">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.origin}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${rel}assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${rel}assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${rel}assets/img/apple-touch-icon.png">
<link rel="preload" href="${rel}assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/ibm-plex-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/css/fonts.css">
<link rel="stylesheet" href="${rel}assets/css/site.css">
<script>document.documentElement.classList.add('js')</script>${jsonLd ? `\n<script type="application/ld+json">${jsonLd}</script>` : ''}
</head>
<body>
<div class="site${home ? '' : ' site--column'}">
${nav({ rel, current, home })}
${body}
${home ? homeFooter({ rel }) : simpleFooter({ rel, current })}
</div>
<script src="${rel}assets/js/site.js" defer></script>${home ? `\n<script type="module" src="${rel}assets/js/galaxy.js"></script>` : ''}
</body>
</html>
`;
}
