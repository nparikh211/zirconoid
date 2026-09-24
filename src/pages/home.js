import { SITE, STAR, esc, ORGANIZATION, WEBSITE, ORG_ID, SITE_ID } from '../site.js';
import { layout, definitionBubble, ASSET_V } from '../layout.js';
import { CATALOG } from './samples.js';

// The hero headline. scripts/build.mjs puts the same string in llms-full.txt, so a model reading
// the site in one fetch sees what a reader sees.
export const HEADLINE = 'Zirconoid is organizing human-captured data for physical AI';

export const BELIEF = [
  'Physical AI is the future. Zirconoid provides global, human-captured egocentric data to train physical AI models at scale.',
  "Our core belief is that complex data required to teach today's models is bottlenecked by access to diverse, real-world physical environments. Engineering systems that solve technical problems get commoditized. Proprietary human and operator-collected data does not.",
  'From factory floors, warehouses, and construction sites to kitchens, workshops, and homes, we recruit global talent and collect large-scale egocentric datasets for physical AI.',
];

// Home featured Sample Datasets (order matters). Full catalog stays on /samples/.
export const FEATURED_SAMPLE_IDS = [
  'wire-stripping',
  'plastic-clipping',
  'soldering',
];

export const DATASETS = FEATURED_SAMPLE_IDS.map(id => {
  const s = CATALOG.find(c => c.id === id);
  if (!s) throw new Error(`Missing featured sample "${id}" in CATALOG.json`);
  return s;
});

const CHEVRON = '<svg class="faq__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

// The frontier labs, orbiting the claim. Marks live in public/assets/img/labs, redrawn from the
// MIT-licensed @lobehub/icons set as cream silhouettes and balanced by ink area so no one mark
// shouts over the others. See scripts/labs.py to regenerate them.
export const FRONTIER_LABS = [
  { name: 'OpenAI', file: 'openai' },
  { name: 'Anthropic', file: 'anthropic' },
  { name: 'Google DeepMind', file: 'deepmind' },
  { name: 'Mistral AI', file: 'mistral' },
  { name: 'xAI', file: 'xai' },
];

export const FAQ = [
  {
    q: 'What does Zirconoid do?',
    a: 'Zirconoid is a talent engine for operator data. We recruit the people who do real work and we capture what they do, then deliver those datasets to teams building physical AI. Operators join by the hour for capture scenarios, or on contract and full-time.',
  },
  {
    q: 'Who does Zirconoid work with?',
    a: 'Teams building physical AI — data companies, robotics organizations, and research groups. We recruit operators and run the capture. Engagements sit under a signed statement of work, license, or MSA.',
  },
  {
    q: 'What is egocentric data?',
    a: "Egocentric data is video recorded from the operator's own point of view, usually with a head-mounted camera. It shows where the hands go, where the eyes go, and what the environment looks like at the moment a decision is made, which is difficult to reproduce any other way.",
  },
  {
    q: 'What kinds of datasets does Zirconoid collect?',
    a: 'Three programs are running now: egocentric video from textile factory floors, full 8-hour egocentric shifts on motherboard assembly lines, and egocentric capture across multi-station manufacturing plants. We take on new domains wherever humans still outperform models.',
  },
  {
    q: 'Why is human-collected data hard to replace with synthetic data?',
    a: 'Engineering systems that solve technical problems get commoditized. Fresh human-collected and operator-collected data does not, because it is specific to the person, the place, and the task. A real operator performs the version of a task that works on this machine, with this material, on this shift, and those deviations are the signal.',
  },
  {
    q: 'How does Zirconoid recruit and vet operators?',
    a: 'We source through direct relationships with employers, referrals from operators already in our network, and open recruiting in regions where an industry is concentrated. Vetting is practical for floor work: operators perform a short segment of the task on camera and a domain reviewer confirms the technique.',
  },
  {
    q: 'How are operators paid?',
    a: 'Operators are paid hourly for capture sessions, with a premium for full-shift recordings and for wearing equipment. Contract and full-time arrangements are available for programs that run for months.',
  },
  {
    q: 'How do I talk to a data expert?',
    a: `Use the Talk to a Data Expert form on this site. Tell us the domain and volume you need — we return a scoped sample and a capture plan. You can also email ${SITE.email}. Sample datasets are confidential and licensed for internal evaluation only.`,
  },
  {
    q: 'Where does Zirconoid operate?',
    a: 'Worldwide. We recruit talent globally and run capture wherever the ground truth lives, from factory floors, warehouses, and construction sites to kitchens, workshops, and homes.',
  },
];

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
          <img src="assets/img/samples/${esc(s.posterA)}?v=3" alt="" width="320" height="180" loading="lazy" decoding="async">
          <img src="assets/img/samples/${esc(s.posterB)}?v=3" alt="" width="320" height="180" loading="lazy" decoding="async">
          <span class="sample-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
        </div>
        <h3 class="sample-card__title">${esc(s.title)}</h3>
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
      '@type': 'WebPage',
      '@id': `${SITE.origin}/#webpage`,
      url: SITE.origin + '/',
      name: 'Zirconoid — Human-captured data for physical AI',
      description: SITE.description,
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      inLanguage: 'en',
      dateModified: SITE.updated,
      primaryImageOfPage: `${SITE.origin}/assets/img/og.jpg`,
    },
    {
      '@type': 'Service',
      '@id': `${SITE.origin}/#service`,
      name: 'Operator data collection and recruiting',
      serviceType: 'AI training data collection',
      provider: { '@id': ORG_ID },
      areaServed: SITE.areaServed,
      audience: { '@type': 'BusinessAudience', name: 'Teams building physical AI models' },
      description: 'Zirconoid recruits operators and collects specialized datasets, including egocentric video and operator-collected datasets, for teams building physical AI, including data companies, robotics organizations, and research groups.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Dataset programs',
        itemListElement: DATASETS.map(d => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Dataset',
            name: d.title,
            description: d.desc,
            creator: { '@id': ORG_ID },
            variableMeasured: d.task,
            about: d.environment,
            keywords: [d.task, d.environment, d.inventory].join(', '),
            encodingFormat: 'video/mp4',
            contentUrl: `${SITE.origin}/assets/video/samples/${d.video}`,
            thumbnailUrl: `${SITE.origin}/assets/img/samples/${d.posterA}`,
            isAccessibleForFree: false,
            license: `${SITE.origin}/terms/`,
          },
        })),
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE.origin}/#faq`,
      isPartOf: { '@id': SITE_ID },
      mainEntity: FAQ.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const body = `
<div class="galaxy-hero" data-galaxy-hero aria-hidden="true">
  <zirconoid-galaxy core="#f2f2ee" accent="#b9b9b3" outer="#5c5c58" particle-size="0.6" rotation-speed="0.35" mouse="1"></zirconoid-galaxy>
</div>

<main>
<section class="hero" aria-label="Introduction">
  <div class="hero__inner">
    <h1 class="hero__title" data-hero-title>${esc(HEADLINE)}</h1>
  </div>
</section>

<section class="belief" aria-label="What we believe">
  <div class="belief__inner">
    <span class="belief__mark-wrap" tabindex="0" aria-label="Zirconoid mark" aria-describedby="zr-definition-top">
      <img class="belief__mark" src="assets/img/mark.svg" alt="" width="64" height="64" data-belief-mark>
      ${definitionBubble('zr-definition-top', 'center')}
    </span>
    <div class="belief__text" data-belief>
${BELIEF.map(t => `      <p>${esc(t)}</p>`).join('\n')}
    </div>
  </div>
</section>

<section class="trust" aria-labelledby="trust-title" data-reveal>
  <div class="trust__orbit" data-orbit>
    <div class="trust__ring">
${FRONTIER_LABS.map(b => `      <img class="trust__logo" src="assets/img/labs/${b.file}.png" alt="${esc(b.name)}" width="44" height="44" loading="lazy" decoding="async">`).join('\n')}
    </div>
    <h2 class="trust__title" id="trust-title">Trusted by the data providers who support the frontier</h2>
  </div>
</section>

<section class="work" id="work" aria-labelledby="work-title">
  <div class="work__head" data-reveal>
    <div>
      <p class="eyebrow">Our work</p>
      <h2 class="h2" id="work-title">Datasets collected by real people</h2>
    </div>
  </div>
  <div class="work__grid work__grid--samples">${DATASETS.map(card).join('')}
  </div>
  <div class="work__foot" data-reveal>
    <a class="btn work__more-btn" href="samples/"><span>See more Sample Datasets</span></a>
  </div>
</section>

<section class="faq" aria-label="Questions and answers">
  <div class="faq__head" data-reveal>
    <p class="eyebrow">Questions</p>
  </div>
  <div class="faq__list" data-faq data-reveal>
${FAQ.map((f, i) => `    <details class="faq__item" id="faq-${i + 1}" name="zr-faq">
      <summary class="faq__q"><span class="faq__q-text">${esc(f.q)}</span>${CHEVRON}</summary>
      <div class="faq__panel"><div class="faq__panel-inner"><p class="faq__a">${esc(f.a)}</p></div></div>
    </details>`).join('\n')}
  </div>
</section>

<section class="cta" aria-labelledby="cta-title">
  <div class="cta__inner" data-reveal>
    <div class="cta__copy">
      <p class="eyebrow">Work with us</p>
      <h2 class="h2" id="cta-title">Talk to a data expert.</h2>
      <p class="cta__lede">Tell us the domain and volume you need. We will return a scoped sample and a capture plan.</p>
    </div>
    <div class="cta__actions">
      <button type="button" class="btn btn--lg" data-sample-open>${STAR}Talk to a Data Expert</button>
      <a class="mono-link" href="mailto:${SITE.email}">${SITE.email}</a>
    </div>
  </div>
</section>
</main>`;

  const lightbox = `
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
    path: '/',
    title: 'Zirconoid — Human-captured data for physical AI',
    description: SITE.description,
    body: body + lightbox,
    home: true,
    jsonLd,
    extraHead: `\n<link rel="stylesheet" href="${v('assets/css/samples.css')}">`,
    extraScripts: `\n<script src="${v('assets/js/samples.js')}" defer></script>`,
  });
}
