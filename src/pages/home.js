import { SITE, STAR, esc, ORGANIZATION, WEBSITE, ORG_ID, SITE_ID } from '../site.js';
import { layout, definitionBubble } from '../layout.js';

// The hero headline. scripts/build.mjs puts the same string in llms-full.txt, so a model reading
// the site in one fetch sees what a reader sees.
export const HEADLINE = 'Zirconoid is organizing human-captured data for physical AI';

export const BELIEF = [
  'Physical AI is the future. Zirconoid provides global, human-captured egocentric data to train physical AI models at scale.',
  "Our core belief is that complex data required to teach today's models is bottlenecked by access to diverse, real-world physical environments. Engineering systems that solve technical problems get commoditized. Proprietary human and operator-collected data does not.",
  'From factory floors and fields to construction sites and manufacturing plants, we recruit global talent and collect large-scale datasets across diverse physical environments.',
];

export const DATASETS = [
  {
    domain: 'Textile manufacturing',
    title: 'Egocentric video from textile factory floors',
    desc: 'Factory workers wear head-mounted cameras through loom operation, fabric inspection, cutting, and finishing. Every clip is tied to the shift, station, and task the operator was performing.',
    modality: 'Egocentric video + audio',
    operators: 'Textile factory workers, multi-site',
    use: 'Vision-language pretraining, manipulation and defect-recognition policies',
    image: 'textile-ego',
    imageAlt: 'Egocentric view of a textile worker inspecting fabric on a loom in an Indian mill',
  },
  {
    domain: 'Electronics assembly',
    title: '8-hour egocentric days on a motherboard assembly line',
    desc: 'Assembly line workers record full 8-hour shifts of component placement, solder inspection, and test-bench handoffs. Continuous capture preserves the transitions and idle time that short clips drop.',
    modality: 'Egocentric video, 8 hrs/day per operator, synced task logs',
    operators: 'Motherboard assembly line workers',
    use: 'Long-horizon task understanding, procedure grounding for embodied agents',
    image: 'assembly-ego',
    imageAlt: 'Egocentric headcam view of gloved hands soldering a motherboard on an assembly bench',
  },
  {
    domain: 'Oncology',
    title: 'Diagnosis pathways and treatment efficacy trends from oncologists',
    desc: 'Practicing oncologists document diagnostic reasoning step by step, from presentation to staging to treatment selection, alongside efficacy trends observed across de-identified patient cohorts.',
    modality: 'Structured expert text, decision trajectories',
    operators: 'Board-certified oncologists',
    use: 'Expert trajectories for agent evaluation and RL reward modeling in clinical reasoning',
    image: 'oncology-iphone',
    imageAlt: 'Casual phone photo of an oncology desk with handwritten notes, charts, and a CT scan on a monitor',
  },
];

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
    a: 'Zirconoid is a talent engine for operator data. We recruit the people who do real work and we capture what they do, then deliver those datasets to the data companies building physical AI. Operators join by the hour for capture scenarios, or on contract and full-time.',
  },
  {
    q: 'Who does Zirconoid work with?',
    a: 'Data companies and research organizations that supply frontier AI labs. We sit upstream of them: we find the operators and run the capture, they deliver to the labs. Engagements run under a signed statement of work, license, or master services agreement.',
  },
  {
    q: 'What is egocentric data?',
    a: "Egocentric data is video recorded from the operator's own point of view, usually with a head-mounted camera. It shows where the hands go, where the eyes go, and what the environment looks like at the moment a decision is made, which is difficult to reproduce any other way.",
  },
  {
    q: 'What kinds of datasets does Zirconoid collect?',
    a: 'Three programs are running now: egocentric video from textile factory floors, full 8-hour egocentric shifts on motherboard assembly lines, and structured diagnosis pathways and treatment efficacy trends from practicing oncologists. We take on new domains wherever humans still outperform models.',
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
    q: 'How do I request a sample dataset?',
    a: `Email ${SITE.email} with the domain, modality, and volume you need. We return a scoped sample and a capture plan. Sample datasets are confidential and licensed for internal evaluation only.`,
  },
  {
    q: 'Where does Zirconoid operate?',
    a: 'Worldwide. We recruit talent globally and run capture wherever the ground truth lives, from factory floors and assembly lines to clinics and workshops.',
  },
];

const card = d => `
      <article class="card" data-reveal>
        <span class="card__domain">${esc(d.domain)}</span>
        <div class="card__media${d.image ? ' card__media--shot' : ''}">${d.image
          ? `<img src="assets/img/work/${d.image}.jpg" alt="${esc(d.imageAlt || d.title)}" loading="lazy" decoding="async">`
          : '<span>Coming soon</span>'}</div>
        <h3 class="card__title">${esc(d.title)}</h3>
        <p class="card__desc">${esc(d.desc)}</p>
        <dl class="card__meta">
          <dt>Modality</dt><dd>${esc(d.modality)}</dd>
          <dt>Operators</dt><dd>${esc(d.operators)}</dd>
          <dt>Used for</dt><dd>${esc(d.use)}</dd>
        </dl>
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
      audience: { '@type': 'BusinessAudience', name: 'Data companies supplying frontier AI labs' },
      description: 'Zirconoid recruits operators and domain experts and collects specialized datasets, including egocentric video and expert reasoning trajectories, for the data companies that supply frontier AI labs.',
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
            variableMeasured: d.modality,
            about: d.domain,
            keywords: [d.domain, d.modality, d.operators].join(', '),
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
  <div class="work__grid">${DATASETS.map(card).join('')}
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
      <h2 class="h2" id="cta-title">Request a sample dataset.</h2>
      <p class="cta__lede">Tell us the domain, modality, and volume you need. We will return a scoped sample and a capture plan.</p>
    </div>
    <div class="cta__actions">
      <a class="btn btn--lg" href="${SITE.sampleMailto}">${STAR}Request a sample dataset</a>
      <a class="mono-link" href="mailto:${SITE.email}">${SITE.email}</a>
    </div>
  </div>
</section>
</main>`;

  return layout({
    path: '/',
    title: 'Zirconoid — Human-captured data for physical AI',
    description: SITE.description,
    body,
    home: true,
    jsonLd,
  });
}
