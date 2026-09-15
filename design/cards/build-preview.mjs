// Builds a plain, dependency-free preview page from the .dc.html artboards.
// Re-run after editing any card: node build-preview.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const CARDS = [
  ['The card — C front / A back', 'Main.dc.html', 'Back.dc.html'],
  ['Alternate — A front', 'FrontA.dc.html', null],
  ['Alternate — B', 'FrontB.dc.html', 'BackB.dc.html'],
  ['Alternate — C back', null, 'BackC.dc.html'],
];

const body = (file) => {
  const src = readFileSync(file, 'utf8');
  const inner = src.slice(src.indexOf('<x-dc>') + 6, src.indexOf('</x-dc>'));
  return inner.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
};

const rows = CARDS.map(([name, front, back]) => `
  <section class="row">
    <h2>${name}</h2>
    <div class="pair">
      ${front ? `<figure><div class="card">${body(front)}</div><figcaption>front</figcaption></figure>` : ''}
      ${back ? `<figure><div class="card">${body(back)}</div><figcaption>back</figcaption></figure>` : ''}
    </div>
  </section>`).join('\n');

writeFileSync('preview.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Annabel's Pet Care — card directions</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --ink:#2B2527; --muted:#665E61; --line:#EBE1DC; }
  body { margin:0; background:#EFEAE6; color:var(--ink);
         font-family:'Plus Jakarta Sans',system-ui,sans-serif; padding:48px 32px 80px; }
  header { max-width:1100px; margin:0 auto 40px; }
  h1 { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; font-size:34px; margin:0 0 8px; }
  header p { margin:0; color:var(--muted); font-size:13px; line-height:1.6; max-width:60ch; }
  .zoom { max-width:1100px; margin:24px auto 0; display:flex; align-items:center; gap:12px;
          font-size:12px; color:var(--muted); }
  .row { max-width:1100px; margin:0 auto 52px; }
  h2 { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted);
       font-weight:600; margin:0 0 16px; padding-bottom:10px; border-bottom:1px solid var(--line); }
  .pair { display:flex; flex-wrap:wrap; gap:40px; }
  figure { margin:0; }
  .card { width:336px; height:192px; overflow:hidden; border-radius:3px;
          box-shadow:0 1px 2px rgba(43,37,39,.10), 0 8px 24px rgba(43,37,39,.13);
          transform-origin:top left; transition:transform .15s ease; }
  figcaption { margin-top:10px; font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:var(--muted); }
  body.x2 .card { transform:scale(2); }
  body.x2 figure { width:672px; height:384px; }
  body.x2 figcaption { margin-top:200px; }
  .card > div { width:336px !important; height:192px !important; }
</style></head>
<body>
<header>
  <h1>Annabel&#39;s Pet Care — card directions</h1>
  <p>Shown at true trim size, 3.5 &times; 2 in. Palette and type taken from the live site&#39;s
  <code>styles.css</code>. <strong>[PHONE]</strong> and <strong>[QR]</strong> are placeholders.
  &ldquo;Insured&rdquo; is deliberately absent until the policy is bound.</p>
</header>
<div class="zoom">
  <label><input type="checkbox" id="z"> View at 2&times; (screen legibility — print size is the 1&times; view)</label>
</div>
${rows}
<script>
  document.getElementById('z').addEventListener('change', e =>
    document.body.classList.toggle('x2', e.target.checked));
</script>
</body></html>`);
console.log('wrote preview.html');
