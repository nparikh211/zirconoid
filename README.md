# zirconoid.com

Marketing site for Zirconoid Inc. Static HTML, CSS and JavaScript, built with a small Node script and hosted on GitHub Pages behind Cloudflare DNS.

## Pages

| URL | Source |
| --- | --- |
| `/` | `src/pages/home.js` |
| `/blog/` and `/blog/<slug>/` | `src/pages/blog.js`, posts in `src/content/posts.json` |
| `/privacy/`, `/terms/` | `src/pages/legal.js` |
| `/404.html` | `src/pages/notfound.js` |

`src/layout.js` holds the document shell, nav and both footers. `src/site.js` holds site constants (name, email, copyright) and the star icon used on buttons.

## Run it

```sh
npm install
npm run dev        # build, then serve dist/ at http://localhost:4173
npm run build      # write dist/
npm run check      # verify links, titles, alt text and required files in dist/
npm test           # build, then run the Playwright suite (desktop + mobile)
```

`npm test` needs a Chromium. Run `npx playwright install chromium` once, or set `CHROMIUM_PATH` to an existing binary.

## Layout of the repo

```
public/            copied verbatim into dist/
  assets/css/      site.css (all styles), fonts.css (self-hosted @font-face rules)
  assets/js/       site.js (scroll effects), galaxy.js (WebGL Milky Way custom element)
  assets/fonts/    Montserrat, IBM Plex Sans, JetBrains Mono (variable woff2, latin subsets)
  assets/img/      mark.svg and PNG marks, favicon, Open Graph image
  assets/vendor/   three.js 0.160 (MIT)
  CNAME            custom domain for GitHub Pages
src/               page templates and content
scripts/           build.mjs, serve.mjs, check.mjs
tests/             Playwright specs
```

## How the home page effects work

All of it lives in `public/assets/js/site.js` and `public/assets/css/site.css`.

- **Nav blur.** The nav is transparent. A separate layer behind it (`.nav__blur`) gets `backdrop-filter: blur(4px)` once the hero headline scrolls within 90px of the top. Sub pages keep the blur on at all times.
- **Galaxy.** `<zirconoid-galaxy>` is a custom element that renders a GPGPU particle galaxy with three.js. The hero copy sits in a masked layer above the nav (`z-index: 60`) so the nav blur never touches it, and it moves at 0.62x scroll speed for parallax. The footer copy has mouse tilt off, spins slower and is dimmed to 45%.
- **Belief text.** `site.js` splits each paragraph into word spans. On every scroll frame, words in the bottom 84px of the viewport are blurred (up to 6.3px) and dimmed (down to 14%); everything above is sharp. The mark above the text rotates 0.06 degrees per scrolled pixel.
- **Reveals.** Elements with `data-reveal` fade up when they enter the viewport. After 950ms they get `is-settled`, which hands them back their own hover transitions.
- **Footer mark.** Spins one full turn every 14 seconds, but only while hovered (`animation-play-state`).

`prefers-reduced-motion` turns all of it off: text is sharp, reveals are instant, the galaxy stands still.

## Editing content

- Home copy and the three dataset cards: `src/pages/home.js` (`BELIEF`, `DATASETS`).
- Blog posts: add an object to `src/content/posts.json`. Each needs `slug`, `tag`, `date`, `isoDate`, `read`, `title`, `excerpt`, `body` (array of paragraphs). The build writes `/blog/<slug>/index.html` and adds it to the sitemap.
- Legal text: `src/pages/legal.js`. Change `EFFECTIVE` when you change the text.
- Dataset card images: the cards use a striped placeholder box (`.card__media`). Swap in an `<img>` there when stills are ready.

## Deploying

See [docs/DEPLOY.md](docs/DEPLOY.md). Pushing to `main` builds and publishes the site through GitHub Pages.

## Tests

`tests/` covers every page on desktop and mobile Chromium: page load with no console errors or failed requests, nav blur toggling, parallax offsets, word-by-word reveal, card and button hover states, footer mark spin, galaxy rendering (hero and footer) from the vendored three.js, blog routing including old `#slug` links, legal page sections, the 404 page, sitemap, robots and CNAME. `npm run check` is a fast static pass over `dist/` for broken links and missing metadata.
