// Extracts just the readable text (title, headings, paragraphs, pull-quotes)
// from index.html and renders a simple A4 PDF via headless Chrome.
const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// --- helpers ---------------------------------------------------------------
function clean(s) {
  return s
    .replace(/<a\b[^>]*>(.*?)<\/a>/gis, '$1')      // drop links, keep text
    .replace(/<\/?(em|span|strong|i|b)\b[^>]*>/gi, '') // strip inline tags
    .replace(/<[^>]+>/g, '')                        // any remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Walk the document in order, emitting content blocks.
const blocks = [];
const re = /<(h2|p)\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
let m;
while ((m = re.exec(html)) !== null) {
  const cls = m[2];
  const text = clean(m[3]);
  if (!text) continue;
  if (/\bchapter__title\b/.test(cls)) blocks.push({ type: 'h2', text });
  else if (/\bprose\b/.test(cls))     blocks.push({ type: 'p', text });
  else if (cls.trim() === 'display')  blocks.push({ type: 'quote', text });
}

// Cover + finale are bespoke markup — add by hand, in place.
const deck = clean((html.match(/<div class="cover__deck">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '');

const renderBlocks = blocks.map(b => {
  if (b.type === 'h2')    return `<h2>${b.text}</h2>`;
  if (b.type === 'quote') return `<blockquote>${b.text}</blockquote>`;
  return `<p>${b.text}</p>`;
}).join('\n');

const doc = `<!doctype html><html><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 22mm 20mm; }
  * { box-sizing: border-box; }
  body { font: 11.5pt/1.65 Georgia, "Times New Roman", serif; color: #1a1a1a; }
  header { text-align: center; margin-bottom: 26pt; }
  .kicker { font: 8pt/1 Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #777; }
  h1 { font: 700 30pt/1.1 Georgia, serif; margin: 10pt 0 6pt; letter-spacing: .01em; }
  .deck { font-style: italic; color: #444; max-width: 30em; margin: 8pt auto 0; }
  h2 { font: 700 15pt/1.25 Georgia, serif; text-transform: uppercase; letter-spacing: .02em;
       margin: 26pt 0 8pt; page-break-after: avoid; }
  p { margin: 0 0 11pt; text-align: justify; hyphens: auto; }
  blockquote { margin: 16pt 0; padding: 0; font: italic 600 14pt/1.4 Georgia, serif;
               text-align: center; color: #111; }
  footer { margin-top: 30pt; border-top: 1px solid #ccc; padding-top: 10pt;
           font: 8pt/1.5 Arial, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #888; }
</style></head><body>
<header>
  <div class="kicker">Vol. 01 — The Belonging Issue · Spring 2026</div>
  <h1>Health Is a Team Sport</h1>
  <p class="deck">${deck}</p>
</header>
${renderBlocks}
<footer>Written by Simone Staffa · health is a team sport · 2026</footer>
</body></html>`;

const outHtml = path.join(ROOT, 'health-is-a-team-sport.print.html');
const outPdf = path.join(ROOT, 'health-is-a-team-sport.pdf');
fs.writeFileSync(outHtml, doc);

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync(chrome, [
  '--headless', '--disable-gpu', '--no-pdf-header-footer',
  `--print-to-pdf=${outPdf}`,
  `file://${outHtml}`,
], { stdio: 'inherit' });

fs.unlinkSync(outHtml);
console.log(`\n${blocks.length} text blocks → ${path.relative(ROOT, outPdf)}`);
