// Small local Markdown → HTML helper for legal docs (no heavy dependency).
// Supports: headings, paragraphs, ul/ol, tables, bold, italic, code, hr, links, hard breaks.
import { esc } from './site.js';

function inline(s) {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+|\/[^)\s]*)\)/g, (_, t, href) =>
    `<a href="${esc(href)}"${/^https?:/.test(href) ? ' rel="noopener noreferrer"' : ''}>${t}</a>`);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return out;
}

function isTableSep(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(line) && /\|/.test(line) && /-/.test(line);
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

function joinPara(lines) {
  // GFM: two trailing spaces = hard line break; otherwise soft-wrap with a space.
  let html = '';
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const hard = / {2}$/.test(raw);
    const text = raw.replace(/\s+$/, '');
    html += inline(text);
    if (i < lines.length - 1) html += hard ? '<br>\n' : ' ';
  }
  return html;
}

function isBlockStart(line, next) {
  if (/^\s*$/.test(line)) return true;
  if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) return true;
  if (/^#{1,4}\s+/.test(line)) return true;
  if (/^```/.test(line)) return true;
  if (/^\s*[-*+]\s+/.test(line)) return true;
  if (/^\s*\d+\.\s+\S/.test(line) && !/^\s*\d+\.\d+/.test(line)) return true;
  if (line.includes('|') && next !== undefined && isTableSep(next)) return true;
  return false;
}

/**
 * Convert Markdown to HTML fragments suitable for a .legal container.
 * @param {string} md
 * @param {{ skipFirstH1?: boolean }} [opts]
 * @returns {{ title: string, html: string }}
 */
export function mdToHtml(md, { skipFirstH1 = true } = {}) {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let title = '';
  let i = 0;
  let skippedH1 = false;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    const hm = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (hm) {
      const level = hm[1].length;
      const text = hm[2].trim();
      if (level === 1 && skipFirstH1 && !skippedH1) {
        title = text;
        skippedH1 = true;
        i++;
        continue;
      }
      if (level === 1 && !title) title = text;
      out.push(`<h${level}>${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      if (i < lines.length) i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headers = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${headers.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      out.push(`<ul>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+\S/.test(line) && !/^\s*\d+\.\d+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+\S/.test(lines[i]) && !/^\s*\d+\.\d+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(`<ol>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ol>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && !isBlockStart(lines[i], lines[i + 1])) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) out.push(`<p>${joinPara(buf)}</p>`);
  }

  return { title, html: out.join('\n') };
}
