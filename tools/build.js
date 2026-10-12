/**
 * Build.
 *
 *   node tools/build.js --dev    → ./index.html, linking src/ directly
 *                                  (ES modules, unbundled; for `npm run dev`)
 *   node tools/build.js          → ./index.html AND ./dist/ (bundled, minified,
 *                                  assets copied; for `npm run preview`)
 *
 * Both outputs come from the same template, so what you develop against and
 * what you ship cannot drift apart.
 *
 * Template placeholders expanded here:
 *   {{head}}     stylesheet links
 *   {{scripts}}  module script tag
 *   {{fig  id="…" ratio="…" sizes="…" priority="true"}}  → framed <picture>
 *   {{pic  id="…" class="…" sizes="…" priority="true"}}  → bare <picture>
 *   {{preload id="…" sizes="…"}}                         → hero <link rel=preload>
 *   {{src  id="…" w="…" ext="…"}}                        → one asset URL
 *
 * The last two exist so that no filename is ever hand-written in the template.
 * Widths depend on each original's intrinsic size, so a hardcoded
 * "…-1600.jpg" silently 404s the moment an original is swapped.
 */

import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEV = process.argv.includes('--dev');

const CSS_FILES = [
  'tokens.css',
  'base.css',
  'components.css',
  'header.css',
  'hero.css',
  'sections.css',
  'reveal.css',
];

const imageData = JSON.parse(
  await readFile(join(ROOT, 'assets', 'image-data.json'), 'utf8')
);

/* ── Attribute parsing ────────────────────────────────────────────────────── */

function parseAttrs(raw) {
  const out = {};
  for (const m of raw.matchAll(/(\w+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── <picture> generation ─────────────────────────────────────────────────── */

function srcset(base, widths, ext) {
  return widths.map((w) => `assets/${base}-${w}.${ext} ${w}w`).join(', ');
}

function buildPicture(id, { className = '', sizes = '100vw', priority = false }) {
  const d = imageData[id];
  if (!d) throw new Error(`Unknown image id "${id}". Check tools/assets.config.js.`);

  const fallbackW = d.widths[Math.min(d.widths.length - 1, 2)];
  const alt = d.decorative ? '' : escapeAttr(d.alt);

  // Decorative images are hidden from assistive tech entirely, not just given
  // an empty alt, so they never surface as unlabelled graphics.
  const ariaHidden = d.decorative ? ' aria-hidden="true"' : '';

  const loading = priority
    ? ' fetchpriority="high" decoding="async"'
    : ' loading="lazy" decoding="async"';

  return `<picture${className ? ` class="${className}"` : ''}>
<source type="image/avif" srcset="${srcset(d.base, d.widths, 'avif')}" sizes="${escapeAttr(sizes)}">
<source type="image/webp" srcset="${srcset(d.base, d.widths, 'webp')}" sizes="${escapeAttr(sizes)}">
<img src="assets/${d.base}-${fallbackW}.jpg" srcset="${srcset(d.base, d.widths, 'jpg')}" sizes="${escapeAttr(sizes)}" width="${d.width}" height="${d.height}" alt="${alt}"${ariaHidden}${loading}>
</picture>`;
}

/**
 * Hero preload. Uses exactly the same type, srcset and sizes as the AVIF
 * <source> it is preloading, so the preload scanner and the layout engine
 * resolve to the same candidate and the browser does not warn about an
 * unused preload.
 */
function buildPreload(id, sizes) {
  const d = imageData[id];
  if (!d) throw new Error(`Unknown image id "${id}".`);
  const widest = d.widths[d.widths.length - 1];
  return `<link rel="preload" as="image" type="image/avif" fetchpriority="high"
      href="assets/${d.base}-${widest}.avif"
      imagesrcset="${srcset(d.base, d.widths, 'avif')}"
      imagesizes="${escapeAttr(sizes)}">`;
}

/** One asset URL, clamped to a width that was actually generated. */
function buildSrc(id, wanted, ext) {
  const d = imageData[id];
  if (!d) throw new Error(`Unknown image id "${id}".`);
  const w = d.widths.reduce(
    (best, cur) => (cur <= wanted && cur > best ? cur : best),
    d.widths[0]
  );
  return `assets/${d.base}-${w}.${ext}`;
}

function buildFig(id, attrs) {
  const d = imageData[id];
  if (!d) throw new Error(`Unknown image id "${id}". Check tools/assets.config.js.`);
  const ratio = attrs.ratio ? ` ${attrs.ratio}` : '';
  // --focus lets a tight crop keep its subject; --lqip lives on the frame so a
  // failed <img> still leaves a filled, correctly-sized slot.
  const focus = attrs.focus || d.focus || 'center';
  const style = `--lqip:url('${d.lqip}');--focus:${focus}`;
  return `<div class="fig__frame${ratio}" style="${style}">
${buildPicture(id, { sizes: attrs.sizes, priority: attrs.priority === 'true' })}
</div>`;
}

/* ── Template expansion ───────────────────────────────────────────────────── */

function expand(html, { head, scripts }) {
  let out = html;

  out = out.replace(/\{\{fig\s+([^}]*)\}\}/g, (_, raw) => {
    const a = parseAttrs(raw);
    return buildFig(a.id, a);
  });

  out = out.replace(/\{\{pic\s+([^}]*)\}\}/g, (_, raw) => {
    const a = parseAttrs(raw);
    return buildPicture(a.id, {
      className: a.class,
      sizes: a.sizes,
      priority: a.priority === 'true',
    });
  });

  out = out.replace(/\{\{preload\s+([^}]*)\}\}/g, (_, raw) => {
    const a = parseAttrs(raw);
    return buildPreload(a.id, a.sizes || '100vw');
  });

  out = out.replace(/\{\{src\s+([^}]*)\}\}/g, (_, raw) => {
    const a = parseAttrs(raw);
    return buildSrc(a.id, Number(a.w) || 1280, a.ext || 'jpg');
  });

  out = out.replace('{{head}}', head).replace('{{scripts}}', scripts);

  const leftover = out.match(/\{\{[^}]+\}\}/);
  if (leftover) throw new Error(`Unexpanded placeholder: ${leftover[0]}`);

  return out;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

async function dirSize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    total += entry.isDirectory() ? await dirSize(p) : (await stat(p)).size;
  }
  return total;
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

/* ── Run ──────────────────────────────────────────────────────────────────── */

const template = await readFile(join(ROOT, 'src', 'index.html'), 'utf8');

// ── Dev output: root index.html, links src/ directly. ──────────────────────
const devHead = CSS_FILES.map((f) => `<link rel="stylesheet" href="src/css/${f}">`).join(
  '\n'
);
// Cache-busted in dev: some browsers hold on to an ES module graph even with
// `no-store`, which makes editing source feel like nothing is happening.
// Production needs no equivalent — esbuild emits content-hashed chunks.
const stamp = Date.now().toString(36);
const devScripts = `<script type="module" src="src/js/main.js?b=${stamp}"></script>`;

await writeFile(join(ROOT, 'index.html'), expand(template, {
  head: devHead,
  scripts: devScripts,
}));
console.log('  ✓ index.html            (dev — links src/ directly)');

if (DEV) {
  console.log('\n  Dev build done. Run: npm run dev');
  process.exit(0);
}

// ── Production output: dist/ ───────────────────────────────────────────────
const DIST = join(ROOT, 'dist');
await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, 'assets'), { recursive: true });

// CSS: concatenate in order, then minify.
const cssSource = (
  await Promise.all(
    CSS_FILES.map((f) => readFile(join(ROOT, 'src', 'css', f), 'utf8'))
  )
).join('\n');

// The font @font-face URLs are relative to src/css/; in dist the stylesheet
// sits at dist/app.css, one level above assets/.
const cssRebased = cssSource.replace(/\.\.\/\.\.\/assets\//g, 'assets/');

const cssOut = await esbuild.transform(cssRebased, {
  loader: 'css',
  minify: true,
});
await writeFile(join(DIST, 'app.css'), cssOut.code);

// JS: bundle from main.js. The dynamic import of hero-slats.js is preserved as
// a separate chunk so it is only fetched on devices that actually run it.
const js = await esbuild.build({
  entryPoints: [join(ROOT, 'src', 'js', 'main.js')],
  bundle: true,
  format: 'esm',
  splitting: true,
  minify: true,
  target: ['es2020'],
  outdir: DIST,
  entryNames: 'app',
  chunkNames: 'chunk-[hash]',
  metafile: true,
  logLevel: 'warning',
});

await writeFile(
  join(DIST, 'index.html'),
  expand(template, {
    head: '<link rel="stylesheet" href="app.css">',
    scripts: '<script type="module" src="app.js"></script>',
  })
);

// Assets: everything except the untouched originals, which are a source
// archive and have no business in a production bundle.
await cp(join(ROOT, 'assets'), join(DIST, 'assets'), {
  recursive: true,
  filter: (src) => !src.includes(`${'assets'}/originals`),
});
await rm(join(DIST, 'assets', 'originals'), { recursive: true, force: true });
await rm(join(DIST, 'assets', 'image-data.json'), { force: true });
await rm(join(DIST, 'assets', 'ASSET-MANIFEST.md'), { force: true });

/* ── Report ───────────────────────────────────────────────────────────────── */

const htmlSize = (await stat(join(DIST, 'index.html'))).size;
const cssSize = (await stat(join(DIST, 'app.css'))).size;

const jsFiles = (await readdir(DIST)).filter((f) => f.endsWith('.js'));
let jsSize = 0;
for (const f of jsFiles) jsSize += (await stat(join(DIST, f))).size;

const assetSize = await dirSize(join(DIST, 'assets'));

console.log('  ✓ dist/index.html       ' + kb(htmlSize));
console.log('  ✓ dist/app.css          ' + kb(cssSize));
console.log(`  ✓ dist/*.js (${jsFiles.length})       ` + kb(jsSize) + `  [${jsFiles.join(', ')}]`);
console.log('  ✓ dist/assets/          ' + kb(assetSize) + '  (all variants; a visit loads a fraction)');
console.log('  ─────────────────────────────────');
console.log('  code total              ' + kb(htmlSize + cssSize + jsSize));
console.log('\n  Production build done. Run: npm run preview');
