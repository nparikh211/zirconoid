import { readFileSync } from 'node:fs';
import { SITE, esc, ORGANIZATION, WEBSITE, ORG_ID, SITE_ID, breadcrumbs } from '../site.js';
import { layout, ASSET_V } from '../layout.js';

const CATALOG = JSON.parse(
  readFileSync(new URL('../../public/assets/video/samples/CATALOG.json', import.meta.url), 'utf8'),
);

export { CATALOG };

function isoDuration(mmss) {
  const [m, s] = String(mmss).split(':').map(Number);
  return `PT${m || 0}M${s || 0}S`;
}

const pill = (label, value) => `
            <div class="sample-card__field">
              <span class="sample-card__field-k">${esc(label)}</span>
              <span class="sample-card__field-v">${esc(value)}</span>
            </div>`;

const card = s => `
      <article class="sample-card" data-reveal data-sample-card
        data-video="${esc(s.video)}"
        data-title="${esc(s.title)}"
        data-poster="${esc(s.posterA)}"
        data-orientation="${esc(s.orientation || 'portrait')}"
        tabindex="0"
        role="button"
        aria-label="Play ${esc(s.title)}">
        <div class="sample-card__thumbs" aria-hidden="true">
          <img src="../assets/img/samples/${esc(s.posterA)}?v=3" alt="" width="320" height="180" loading="lazy" decoding="async">
          <img src="../assets/img/samples/${esc(s.posterB)}?v=3" alt="" width="320" height="180" loading="lazy" decoding="async">
          <span class="sample-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
        </div>
        <h2 class="sample-card__title">${esc(s.title)}</h2>
        <p class="sample-card__meta">${esc(s.duration)} · ${esc(s.fps)} · ${esc(s.streams)}</p>
        <div class="sample-card__fields">
${pill('Task', s.task)}
${pill('Environment', s.environment)}
${pill('Inventory', s.inventory)}
        </div>
      </article>`;

export function render() {
  const jsonLd = [
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'CollectionPage',
      '@id': `${SITE.origin}/samples/#webpage`,
      url: `${SITE.origin}/samples/`,
      name: 'Sample Datasets — Zirconoid',
      description: 'Playable sample clips from Zirconoid capture programs: electronics bench work, confectionery portioning, garment ironing, and more.',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      inLanguage: 'en',
      dateModified: SITE.updated,
      hasPart: CATALOG.map(s => ({
        '@type': 'VideoObject',
        name: s.title,
        description: s.desc,
        thumbnailUrl: `${SITE.origin}/assets/img/samples/${s.posterA}`,
        contentUrl: `${SITE.origin}/assets/video/samples/${s.video}`,
        uploadDate: SITE.updated,
        duration: isoDuration(s.duration),
      })),
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Sample Datasets', path: '/samples/' }]),
  ];

  const body = `
<main class="page samples-page">
  <div class="page__inner page__inner--wide">
    <p class="eyebrow">Samples</p>
    <h1 class="page__title">Sample Datasets</h1>
    <p class="page__lede samples-page__lede">Egocentric clips from real benches and plant floors.</p>
    <div class="samples-grid">
${CATALOG.map(card).join('')}
    </div>
    <aside class="samples-collect" data-reveal aria-label="More samples">
      <div class="samples-collect__copy">
        <p class="samples-collect__status"><span class="samples-collect__pulse" aria-hidden="true"></span><span>Actively collecting</span></p>
        <h2 class="samples-collect__title">More egocentric captures are in progress</h2>
        <p class="samples-collect__lede">New benches and plant floors land here as programs finish. Request more samples if you want volume, another domain, or a capture plan.</p>
      </div>
      <button type="button" class="btn btn--lg samples-collect__btn" data-sample-open>Request more samples</button>
    </aside>
  </div>
</main>

<div class="video-lightbox" data-video-lightbox hidden>
  <div class="video-lightbox__backdrop" data-video-close tabindex="-1" aria-hidden="true"></div>
  <div class="video-lightbox__panel" role="dialog" aria-modal="true" aria-labelledby="video-lightbox-title" data-video-panel tabindex="-1">
    <button type="button" class="video-lightbox__x" data-video-close aria-label="Close">&times;</button>
    <h2 class="video-lightbox__title" id="video-lightbox-title" data-video-title></h2>
    <video class="video-lightbox__player" data-video-player controls playsinline preload="metadata"></video>
  </div>
</div>`;

  const v = file => `${file}?v=${ASSET_V[file]}`;
  return layout({
    path: '/samples/',
    title: 'Sample Datasets — Zirconoid',
    description: 'Playable sample clips from Zirconoid capture programs: electronics bench work, confectionery portioning, garment ironing, and more for physical AI.',
    body,
    current: 'samples',
    jsonLd,
    extraHead: `\n<link rel="stylesheet" href="../${v('assets/css/samples.css')}">`,
    extraScripts: `\n<script src="../${v('assets/js/samples.js')}" defer></script>`,
  });
}
