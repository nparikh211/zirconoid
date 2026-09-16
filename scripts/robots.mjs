// robots.txt. Everything is public, and the AI crawlers are named so the intent is unambiguous:
// we want this site read, quoted and cited by search engines and answer engines alike.

// Search, answer engines and assistant fetchers that should read the site.
export const ALLOWED_BOTS = [
  // Search
  'Googlebot', 'Googlebot-Image', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Applebot', 'PetalBot', 'Kagibot', 'Neevabot',
  // Training and answer engines
  'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Applebot-Extended', 'meta-externalagent', 'meta-externalfetcher', 'FacebookBot',
  'Amazonbot', 'Bytespider', 'CCBot', 'cohere-ai', 'cohere-training-data-crawler', 'MistralAI-User', 'DuckAssistBot', 'YouBot',
  'Diffbot', 'Timpibot', 'omgili', 'omgilibot', 'ImagesiftBot', 'AI2Bot', 'Webzio-Extended',
];

export function robotsTxt(origin) {
  const named = ALLOWED_BOTS.map(b => `User-agent: ${b}\nAllow: /`).join('\n\n');
  return `# Every page here is public. Crawl it, index it, quote it, cite it.

User-agent: *
Allow: /
Disallow: /404.html

${named}

# A short map of the site for language models: ${origin}/llms.txt
# The whole site as plain text: ${origin}/llms-full.txt

Sitemap: ${origin}/sitemap.xml
`;
}
