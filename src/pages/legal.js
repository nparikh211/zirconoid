import { SITE, ORGANIZATION, ORG_ID, SITE_ID, WEBSITE, breadcrumbs } from '../site.js';
import { layout } from '../layout.js';

const EFFECTIVE = 'Effective September 17, 2026';

const section = (h, ...ps) => `
      <section>${h ? `\n        <h2>${h}</h2>` : ''}
${ps.map(p => `        <p>${p}</p>`).join('\n')}
      </section>`;

export const EFFECTIVE_ISO = '2026-09-17';

function legalPage({ path, title, description, current, intro, sections }) {
  const body = `
<main class="page">
  <div class="page__inner">
    <p class="eyebrow">Legal</p>
    <h1 class="page__title">${title}</h1>
    <p class="page__meta">${SITE.legalName} · ${EFFECTIVE}</p>
    <div class="legal">${section('', intro)}${sections.map(([h, ...ps]) => section(h, ...ps)).join('')}
    </div>
  </div>
</main>`;
  const jsonLd = [
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'WebPage',
      '@id': `${SITE.origin}${path}#webpage`,
      url: SITE.origin + path,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      datePublished: EFFECTIVE_ISO,
      dateModified: EFFECTIVE_ISO,
    },
    breadcrumbs([{ name: 'Home', path: '/' }, { name: title, path }]),
  ];
  return layout({ path, title: `${title} — Zirconoid`, description, body, current, jsonLd, modified: EFFECTIVE_ISO });
}

export const PRIVACY = {
    path: '/privacy/',
    title: 'Privacy Policy',
    description: 'How Zirconoid Inc. collects, uses, and shares personal information.',
    current: 'privacy',
    intro: 'This Privacy Policy describes how Zirconoid Inc. ("Zirconoid", "we", "us") collects, uses, and shares personal information when you visit zirconoid.com, contact us, or engage with our data collection and talent services (together, the "Services"). By using the Services you agree to the practices described here.',
    sections: [
      ['1. Information we collect',
        '<strong>Information you provide.</strong> Name, email address, company, role, and the contents of any message you send to us, including inquiries to data@zirconoid.com. If you apply to work with us as an operator, contractor, or employee, we collect the information in your application, including work history, certifications, availability, and payment details.',
        '<strong>Information collected automatically.</strong> When you visit our website we collect standard log data such as IP address, browser type, referring pages, pages viewed, and timestamps, and we may use cookies or similar technologies for analytics and site functionality.',
        '<strong>Capture program data.</strong> Operators who participate in capture programs may generate audio, video, text, and task data as part of a program. Collection, use, and rights in this data are governed by the separate participation agreement signed for that program, not by this Policy.'],
      ['2. Online advertising partners',
        'When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others have about you, including by association with your email. We (or service providers on our behalf) may then send communications and marketing to these email addresses. You may opt out of receiving this advertising by visiting <a href="https://app.retention.com/optout" rel="noopener noreferrer">https://app.retention.com/optout</a>.',
        'One such partner is RB2B, which we use to identify companies that visit our website. RB2B may use cookies, device identifiers, and IP addresses for this purpose. See RB2B\'s own privacy documentation for more detail on their processing.'],
      ['3. How we use information',
        'We use personal information to respond to inquiries, evaluate and onboard operators and partners, provide and improve the Services, process payments, communicate about programs and updates, maintain security, comply with legal obligations, and enforce our agreements.'],
      ['4. How we share information',
        'We share personal information with service providers that help us operate (hosting, analytics, payments, communications), with partner data companies where you have applied to or been placed on their program, with professional advisors, in connection with a merger, acquisition, or sale of assets, and where required by law or to protect rights and safety. We do not sell personal information.'],
      ['5. Retention',
        'We keep personal information for as long as needed to fulfil the purposes described above, to comply with legal, tax, and accounting requirements, and to resolve disputes. Application information for operators is retained so we can contact you about future programs unless you ask us to delete it.'],
      ['6. Your rights',
        'Depending on where you live, you may have the right to access, correct, delete, or export your personal information, to object to or restrict certain processing, and to withdraw consent. To exercise these rights, email data@zirconoid.com. We will respond within the time required by applicable law. You may also have the right to complain to a data protection authority.'],
      ['7. International transfers',
        'Zirconoid operates worldwide. Your information may be processed in countries other than the one you live in. Where required, we use appropriate safeguards such as standard contractual clauses for such transfers.'],
      ['8. Security',
        'We use administrative, technical, and physical safeguards designed to protect personal information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.'],
      ['9. Children',
        'The Services are not directed to children under 16, and we do not knowingly collect personal information from them. If you believe a child has provided us personal information, contact us and we will delete it.'],
      ['10. Changes',
        'We may update this Policy from time to time. We will post the revised version here with a new effective date. Material changes will be communicated where required by law.'],
      ['11. Contact',
        `Zirconoid Inc.<br>Privacy inquiries: <a href="mailto:${SITE.email}">${SITE.email}</a>`],
  ],
};

export function renderPrivacy() { return legalPage(PRIVACY); }

export const TERMS = {
    path: '/terms/',
    title: 'Terms of Service',
    description: 'Terms governing use of zirconoid.com and related services provided by Zirconoid Inc.',
    current: 'terms',
    intro: 'These Terms of Service ("Terms") govern your access to and use of the website at zirconoid.com and related content and services provided by Zirconoid Inc. ("Zirconoid", "we", "us"). By accessing or using the site you agree to these Terms. Data collection engagements, dataset licenses, and operator participation are governed by separate written agreements; where those agreements conflict with these Terms, the separate agreement controls.',
    sections: [
      ['1. Eligibility',
        'You must be at least 18 years old and able to form a binding contract to use the site or to apply to participate in a capture program. If you use the site on behalf of an organization, you represent that you have authority to bind that organization to these Terms.'],
      ['2. Our services',
        'Zirconoid recruits operators and domain experts and collects specialized datasets for data companies and research organizations. Descriptions of datasets, programs, and capabilities on the site are for information only and do not constitute an offer. Any engagement is subject to a signed statement of work, license, or master services agreement.'],
      ['3. Sample requests and inquiries',
        'Requests sent to data@zirconoid.com are non-binding. Any sample dataset we provide is confidential, licensed solely for internal evaluation, and may not be redistributed, used for model training, or used for any production purpose unless a written license says otherwise. We may decline any request at our discretion.'],
      ['4. Operator applications',
        'Submitting an application to work with Zirconoid does not create an employment or contractor relationship. Participation in any program, compensation, and rights in captured data are set out in the participation agreement for that program. You agree that information you provide in an application is accurate and that you hold any certifications you claim.'],
      ['5. Intellectual property',
        'The site, its content, the Zirconoid name, and the Zirconoid logo are owned by Zirconoid Inc. or its licensors and are protected by intellectual property laws. You may view and print pages for personal or internal business use. You may not copy, modify, distribute, scrape, or create derivative works from the site or its content without our written permission.'],
      ['6. Acceptable use',
        'You agree not to use the site to violate any law, infringe the rights of others, transmit malicious code, attempt to gain unauthorized access to our systems or data, interfere with the site\'s operation, or misrepresent your identity or affiliation.'],
      ['7. Third-party links',
        'The site may link to third-party websites or services. We do not control and are not responsible for their content, policies, or practices. Your use of them is at your own risk and subject to their terms.'],
      ['8. Disclaimers',
        'The site and its content are provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do not warrant that the site will be uninterrupted, secure, or error-free.'],
      ['9. Limitation of liability',
        'To the fullest extent permitted by law, Zirconoid Inc. and its officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising out of or related to your use of the site. Our total liability for any claim relating to the site will not exceed one hundred US dollars (USD 100).'],
      ['10. Indemnification',
        'You agree to indemnify and hold harmless Zirconoid Inc. from any claims, losses, and expenses, including reasonable legal fees, arising out of your use of the site, your violation of these Terms, or your violation of any rights of a third party.'],
      ['11. Governing law and disputes',
        'These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law principles. Any dispute arising from these Terms or the site will be resolved exclusively in the state or federal courts located in Delaware, and you consent to their jurisdiction.'],
      ['12. Changes and termination',
        'We may modify these Terms at any time by posting the revised version with a new effective date. Continued use of the site after changes take effect constitutes acceptance. We may suspend or terminate access to the site at any time for any reason.'],
      ['13. General',
        'These Terms, together with our <a href="../privacy/">Privacy Policy</a>, are the entire agreement between you and Zirconoid Inc. regarding the site. If any provision is found unenforceable, the remainder stays in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them freely.'],
      ['14. Contact',
        `Zirconoid Inc.<br><a href="mailto:${SITE.email}">${SITE.email}</a>`],
  ],
};

export function renderTerms() { return legalPage(TERMS); }
