// Site-wide constants shared by every page template.
export const SITE = {
  name: 'Zirconoid',
  legalName: 'Zirconoid Inc.',
  domain: 'zirconoid.com',
  origin: 'https://zirconoid.com',
  email: 'data@zirconoid.com',
  sampleMailto: 'mailto:data@zirconoid.com?subject=Sample%20dataset%20request',
  copyright: '© 2026 Zirconoid. Worldwide.',
  description: 'Zirconoid recruits operators and collects human-captured datasets for the data companies that supply frontier AI labs.',
};

// 8-pointed star ring used on every "Request a sample" button.
export const STAR = '<svg class="btn__star" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6.00 0.00L7.76 1.75L10.24 1.76L10.25 4.24L12.00 6.00L10.25 7.76L10.24 10.24L7.76 10.25L6.00 12.00L4.24 10.25L1.76 10.24L1.75 7.76L0.00 6.00L1.75 4.24L1.76 1.76L4.24 1.75Z M6.00 2.80L6.88 3.88L8.26 3.74L8.12 5.12L9.20 6.00L8.12 6.88L8.26 8.26L6.88 8.12L6.00 9.20L5.12 8.12L3.74 8.26L3.88 6.88L2.80 6.00L3.88 5.12L3.74 3.74L5.12 3.88Z" fill="#141414" fill-rule="evenodd"></path></svg>';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
