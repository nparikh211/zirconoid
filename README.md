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
  assets/img/labs/ frontier lab marks, cream silhouettes
  assets/img/work/ capture stills for the dataset cards
  CNAME            custom domain for GitHub Pages
media/             full-size photo originals, not published
src/               page templates, content and the schema.org nodes
scripts/           build.mjs, robots.mjs, serve.mjs, check.mjs
tests/             Playwright specs
```

## How the home page effects work

All of it lives in `public/assets/js/site.js` and `public/assets/css/site.css`.

- **Nav blur.** The nav is transparent. A separate layer behind it (`.nav__blur`) gets `backdrop-filter: blur(4px)` once the hero headline scrolls within 90px of the top. Sub pages keep the blur on at all times.
- **Galaxy.** `<zirconoid-galaxy>` is a custom element that renders a GPGPU particle galaxy with three.js. The hero copy sits in a masked layer above the nav (`z-index: 60`) so the nav blur never touches it, and it moves at 0.62x scroll speed for parallax. The footer copy has mouse tilt off, spins slower and is dimmed to 45%. A perspective camera crops horizontally as the frame narrows, so `resize()` scales the spiral down by the frame's aspect and eases its offset back towards the centre by the same amount; without that the phone showed a sliver of its middle. Under 640px the layer is wider than the screen, runs the height of the hero, is softly masked at the edges and held at 72% opacity, so it carries the whole hero and still sits under the headline.
- **Galaxy on a phone.** Every particle is an additive sprite, so what costs is fill rate, and a phone screen is often denser than a laptop's. Under 760px the element draws 65k particles instead of 160k, a third of the smoke and stars, and at 1.5x pixel density instead of 2x, which is about a quarter of the fragment work; the spiral reads the same at that size, and a lower floor on the aspect fit keeps it large enough to fill the frame. The parallax is off there too: the phone scrolls on its own thread and hands the page a frame after the fact, so a layer that size moved from script trails the scroll and stutters. It also holds still while a finger is dragging the page and picks up 140ms after the page settles, which hands the whole frame to the scroll; since the layer scrolls with the content, a galaxy that pauses for the length of a flick looks like any other background. `resize()` ignores a size it has already seen, since reallocating the drawing buffer mid-scroll costs a frame.
- **Belief text.** `site.js` splits each paragraph into word spans. On every scroll frame, words in the bottom 84px of the viewport are blurred (up to 6.3px) and dimmed (down to 14%); everything above is sharp. Each word's position is measured once in page coordinates rather than read back every frame, and a word writes nothing until its share of the band changes by a hundredth, so most frames touch only the few words crossing the line. The mark above the text rotates 0.06 degrees per scrolled pixel.
- **Reveals.** Elements with `data-reveal` fade up when they enter the viewport. After 950ms they get `is-settled`, which hands them back their own hover transitions.
- **Trusted by.** Five lab marks sit on a sphere centred on the claim, and the sphere turns once every 22.6 seconds. The claim is wider than the sphere it hangs in, and a grid item that overflows its track is laid out from the start edge, so it is taken out of the flow and pinned to the middle of the sphere instead, which is the middle of the page. The lean is kept shallow so the marks cross the line of text rather than arcing clear of it; a near mark is sitting on the words for about a fifth of every turn. Each frame spins the marks about the upright axis, leans the sphere towards the viewer, and projects them with perspective, so depth reads as position, size, brightness and draw order. The claim hangs mid-sphere on z-index 50: a mark on the near side is given 51-99 and paints over the words, one on the far side is given 1-49 and passes behind them, and between any two the nearer covers the farther. That needs `.trust__ring` to have no z-index of its own, since a stacking context there would trap every mark below the claim. The sphere sizes itself from the widest and tallest it ever gets over a full turn, which is why it fills the section instead of hugging a worst-case guess. Five marks is few enough that a Fibonacci spread lets two bunch, so they use equal azimuths at latitudes picked by searching for the widest worst-case gap. It idles whenever the section is off screen or the tab is hidden, and holds still under reduced motion. Under 720px the sphere gives way to a plain row under the claim. Edit the list in `FRONTIER_LABS` (`src/pages/home.js`); the marks in `public/assets/img/labs` are cream silhouettes cut from the MIT-licensed `@lobehub/icons` set and balanced by ink area, regenerated with `python3 scripts/labs.py` (needs Pillow). The labs are deliberately absent from the structured data, since they are not Zirconoid customers; a test enforces that.
- **FAQ accordion.** Plain `<details>` elements, so they open and close with no JavaScript and are keyboard operable for free. The script adds the rest: one row open at a time, a height transition driven by `grid-template-rows: 0fr → 1fr`, and `/#faq-3` opening a given answer. A collapse that starts before the opening transition has moved changes no value and fires no `transitionend`, so a timer closes the row instead.
- **Footer mark.** Spins one full turn every 14 seconds, but only while hovered (`animation-play-state`). It is not a link: showing the definition is all it does, and its wrapper is only as wide as the mark so the empty space either side does nothing.
- **Definition on a touch screen.** Both Zirconoid marks show their definition on hover, which a phone has none of. Under `(hover: none)` a tap opens the definition instead, a tap anywhere else closes it, and only one is open at a time.

`prefers-reduced-motion` turns all of it off: text is sharp, reveals are instant, the galaxy stands still.

## Search and answer engines

The site is built to be read by search engines and by AI answer engines, and to be quotable by both.

- **Structured data.** Every page ships one JSON-LD `@graph` whose nodes reference each other by `@id`: `Organization` and `WebSite` everywhere, plus `WebPage`, `Service` (with a `Dataset` offer per program) and `FAQPage` on the home page, `Blog` on the index, `BlogPosting` with the full `articleBody` on each post, and a `BreadcrumbList` on every sub page. `npm run check` fails the build if any of it stops parsing.
- **FAQ.** The home page answers nine common questions under a plain "Questions" label, with no heading of its own. Every question and answer in the `FAQPage` schema is the same string as the text on the page, which is what answer engines reward; a test asserts the two never drift apart. Edit them in `FAQ` in `src/pages/home.js`. The answers sit in `<details>` elements so they stay in the page source for crawlers whether or not a reader has opened them.
- **robots.txt.** Written by `scripts/robots.mjs`. It allows everything and then names the search, training and assistant crawlers one by one (Googlebot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent and the rest) so the intent is unambiguous. Add or remove names in `ALLOWED_BOTS`.
- **llms.txt and llms-full.txt.** `/llms.txt` follows [llmstxt.org](https://llmstxt.org): a short map of the site with a one-line summary of every page. `/llms-full.txt` is the whole site as plain text, so a model can read everything in one fetch. Both are generated from the same content as the pages, so they cannot fall out of date.
- **Feeds and sitemap.** `/feed.xml` carries every post in full. `/sitemap.xml` uses real per-page dates: post dates for posts, `EFFECTIVE_ISO` for the legal pages, `SITE.updated` for the home page. Bump `SITE.updated` in `src/site.js` when the home or legal wording changes.
- **Per-page meta.** Canonical URL, `robots` with `max-snippet:-1` and `max-image-preview:large`, Open Graph, Twitter cards, `article:published_time` on posts. The 404 page is `noindex,follow`.

## Editing content

- Home copy and the three dataset cards: `src/pages/home.js` (`BELIEF`, `DATASETS`).
- Dataset card stills: give a dataset `image: 'name'` and drop `public/assets/img/work/name.jpg` in place; it replaces the "Coming soon" block. Add `imageAlt` to describe the shot, or it falls back to the card title. Crop about 2:1; the block is 160px tall and covers. Stills are held back to 40% grey on the page and come to full colour when the card is hovered. Full-size originals live in `media/`, which is outside `public/` so they are never published.
- Blog posts: add an object to `src/content/posts.json`. Each needs `slug`, `tag`, `date`, `isoDate`, `read`, `title`, `excerpt`, `body` (array of paragraphs). The build writes `/blog/<slug>/index.html` and adds it to the sitemap.
- FAQ: `FAQ` in `src/pages/home.js`. Keep answers factual; they are what AI assistants will quote.
- Legal text: `src/pages/legal.js`. Change `EFFECTIVE` and `EFFECTIVE_ISO` when you change the text.
- Dataset card images: the cards use a striped placeholder box (`.card__media`). Swap in an `<img>` there when stills are ready.

## Deploying

See [docs/DEPLOY.md](docs/DEPLOY.md). Pushing to `main` builds and publishes the site through GitHub Pages.

## Tests

`tests/seo.spec.mjs` covers the search metadata: structured data on every page, the FAQ schema matching the visible text, robots.txt naming the AI crawlers, the sitemap dates, the RSS feed and both llms files.

`tests/` covers every page on desktop and mobile Chromium: page load with no console errors or failed requests, nav blur toggling, parallax offsets, word-by-word reveal, card and button hover states, footer mark spin, galaxy rendering (hero and footer) from the vendored three.js, blog routing including old `#slug` links, legal page sections, the 404 page, sitemap, robots and CNAME. `npm run check` is a fast static pass over `dist/` for broken links and missing metadata.
