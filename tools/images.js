/**
 * Image pipeline.
 *
 *   node tools/images.js            build missing derivatives
 *   node tools/images.js --force    rebuild everything
 *
 * Reads assets/originals/ + tools/assets.config.js and writes AVIF / WebP / JPEG
 * derivatives into assets/<folder>/, plus assets/image-data.json which carries
 * intrinsic dimensions and an LQIP placeholder for every image so the HTML can
 * reserve exact space (no layout shift) and never show an empty box.
 */
import sharp from 'sharp';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMAGES } from './assets.config.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINALS = join(ROOT, 'assets', 'originals');
const ASSETS = join(ROOT, 'assets');
const FORCE = process.argv.includes('--force');

const FORMATS = [
  { ext: 'avif', opts: { quality: 52, effort: 4 } },
  { ext: 'webp', opts: { quality: 76, effort: 4 } },
  { ext: 'jpg', opts: { quality: 80, progressive: true, mozjpeg: true } },
];

const exists = (p) => access(p).then(() => true, () => false);

async function build() {
  const data = {};
  let made = 0;
  let skipped = 0;

  for (const img of IMAGES) {
    const srcPath = join(ORIGINALS, img.src);
    if (!(await exists(srcPath))) {
      console.warn(`  ! missing original: ${img.src} (${img.id}) — skipped`);
      continue;
    }

    const input = sharp(srcPath, { failOn: 'none' }).rotate(); // honour EXIF orientation
    const meta = await input.metadata();
    const natW = meta.width;
    const natH = meta.height;
    const outDir = join(ASSETS, dirname(img.out));
    await mkdir(outDir, { recursive: true });

    // Never upscale past the original.
    const widths = [...new Set(img.sizes.filter((w) => w <= natW).concat(Math.min(natW, Math.max(...img.sizes))))]
      .sort((a, b) => a - b);

    for (const w of widths) {
      for (const { ext, opts } of FORMATS) {
        const file = join(ASSETS, `${img.out}-${w}.${ext}`);
        if (!FORCE && (await exists(file))) { skipped++; continue; }
        await sharp(srcPath, { failOn: 'none' })
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          [ext === 'jpg' ? 'jpeg' : ext](opts)
          .toFile(file);
        made++;
      }
    }

    // Tiny blurred placeholder, inlined as a data URI. Keeps the slot filled
    // while the real file loads and if it never arrives.
    const lqipBuf = await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .resize({ width: 20 })
      .webp({ quality: 28 })
      .toBuffer();

    data[img.id] = {
      base: img.out,
      widths,
      width: natW,
      height: natH,
      ratio: +(natW / natH).toFixed(4),
      alt: img.alt,
      decorative: img.alt === null,
      focus: img.focus || 'center',
      lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    };

    console.log(`  ✓ ${img.id.padEnd(20)} ${natW}×${natH}  →  ${widths.join(', ')}`);
  }

  await writeFile(join(ASSETS, 'image-data.json'), JSON.stringify(data, null, 2));
  console.log(`\n  ${made} files written, ${skipped} already present.`);
  console.log(`  assets/image-data.json updated (${Object.keys(data).length} images).`);
  return data;
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
