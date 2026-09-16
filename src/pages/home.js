import { SITE, STAR, esc } from '../site.js';
import { layout, definitionBubble } from '../layout.js';

export const BELIEF = [
  "Zirconoid provides specialized datasets that power frontier models, serving as the essential upstream partner for the data companies that supply the world's leading AI labs.",
  'Our core belief is that data that is complex enough to teach today’s frontier models is bottlenecked by access to human operators and the datasets they produce. Engineering systems that solve technical problems get commoditized. Fresh human-collected and operator-collected data does not.',
  'From egocentric work on a factory floor to expert working knowledge used in agent and RL training, we recruit talent globally and collect datasets for data companies.',
];

export const DATASETS = [
  {
    domain: 'Textile manufacturing',
    title: 'Egocentric video from textile factory floors',
    desc: 'Factory workers wear head-mounted cameras through loom operation, fabric inspection, cutting, and finishing. Every clip is tied to the shift, station, and task the operator was performing.',
    modality: 'Egocentric video + audio',
    operators: 'Textile factory workers, multi-site',
    use: 'Vision-language pretraining, manipulation and defect-recognition policies',
    placeholder: 'placeholder: egocentric still, loom station',
  },
  {
    domain: 'Electronics assembly',
    title: '8-hour egocentric days on a motherboard assembly line',
    desc: 'Assembly line workers record full 8-hour shifts of component placement, solder inspection, and test-bench handoffs. Continuous capture preserves the transitions and idle time that short clips drop.',
    modality: 'Egocentric video, 8 hrs/day per operator, synced task logs',
    operators: 'Motherboard assembly line workers',
    use: 'Long-horizon task understanding, procedure grounding for embodied agents',
    placeholder: 'placeholder: egocentric still, assembly line',
  },
  {
    domain: 'Oncology',
    title: 'Diagnosis pathways and treatment efficacy trends from oncologists',
    desc: 'Practicing oncologists document diagnostic reasoning step by step, from presentation to staging to treatment selection, alongside efficacy trends observed across de-identified patient cohorts.',
    modality: 'Structured expert text, decision trajectories',
    operators: 'Board-certified oncologists',
    use: 'Expert trajectories for agent evaluation and RL reward modeling in clinical reasoning',
    placeholder: 'placeholder: abstract diagram, decision pathway',
  },
];

const card = d => `
      <article class="card" data-reveal>
        <span class="card__domain">${esc(d.domain)}</span>
        <div class="card__media" aria-hidden="true"><span>${esc(d.placeholder)}</span></div>
        <h3 class="card__title">${esc(d.title)}</h3>
        <p class="card__desc">${esc(d.desc)}</p>
        <dl class="card__meta">
          <dt>Modality</dt><dd>${esc(d.modality)}</dd>
          <dt>Operators</dt><dd>${esc(d.operators)}</dd>
          <dt>Used for</dt><dd>${esc(d.use)}</dd>
        </dl>
      </article>`;

export function render() {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin,
    logo: `${SITE.origin}/assets/img/icon-512.png`,
    email: SITE.email,
    description: SITE.description,
  });

  const body = `
<div class="galaxy-hero" data-galaxy-hero aria-hidden="true">
  <zirconoid-galaxy core="#f2f2ee" accent="#b9b9b3" outer="#5c5c58" particle-size="0.6" rotation-speed="0.35" mouse="1"></zirconoid-galaxy>
</div>

<main>
<section class="hero" aria-label="Introduction">
  <div class="hero__inner">
    <h1 class="hero__title" data-hero-title>Zirconoid collects human data for frontier training</h1>
  </div>
</section>

<section class="belief" aria-label="What we believe">
  <div class="belief__inner">
    <span class="belief__mark-wrap" tabindex="0" aria-label="Zirconoid mark" aria-describedby="zr-definition-top">
      <img class="belief__mark" src="assets/img/mark.svg" alt="" width="64" height="64" data-belief-mark>
      ${definitionBubble('zr-definition-top', 'right')}
    </span>
    <div class="belief__text" data-belief>
${BELIEF.map(t => `      <p>${esc(t)}</p>`).join('\n')}
    </div>
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
    title: 'Zirconoid — Human data for frontier training',
    description: SITE.description,
    body,
    home: true,
    jsonLd,
  });
}
