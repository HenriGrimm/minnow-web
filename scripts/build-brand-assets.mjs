/**
 * build-brand-assets.mjs — render the favicon/OG raster set from the brand
 * SVGs. Spec §5.3: brand black #0f0f10 and lockup grey #6b6b70 live only in
 * the theme-independent brand assets, so they are baked into the raster here
 * and never into src/styles.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Outputs into public/brand/:
 *   icon-192.png          — 192px fish mark on a brand-black rounded tile
 *   icon-512.png          — 512px, same
 *   apple-touch-icon.png  — 180px, same (iOS ignores alpha, so the tile matters)
 *   favicon.ico           — multi-size ICO (16/24/32/48) of the mark
 *
 * The script builds a brand-black tile (rounded square) with the cream fish
 * mark — matching favicon.svg's dark-mode ground — and resizes/packs it into
 * PNG + ICO. The hex is already sanctioned to these theme-independent brand
 * assets (spec §5.3); nothing here introduces colour into src/styles.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'public', 'brand');
mkdirSync(brandDir, { recursive: true });

const BRAND_BLACK = '#0f0f10';

// The tile SVGs: a rounded brand-black square with the cream fish mark centred,
// matching favicon.svg's dark-mode ground so the raster set reads as the same
// mark. The fish + tail paths are the canonical spec §5.3 geometry, scaled to
// the 100 grid and centred on the 100×100 tile.
function tileSvg(markColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="${BRAND_BLACK}"/>
  <path fill="${markColor}" d="M16 50 C 26 36, 44 32, 56 42 L 69 50 L 56 58 C 44 68, 26 64, 16 50 Z M69 50 L 84 40 L 81 50 L 84 60 Z"/>
  <circle cx="27" cy="46" r="2.2" fill="${BRAND_BLACK}"/>
</svg>`;
}

async function renderPng(name, size) {
  const svg = Buffer.from(tileSvg('#f7f7f4'));
  const out = await sharp(svg, { density: 96 * (size / 100) }).resize(size, size).png().toBuffer();
  writeFileSync(join(brandDir, name), out);
  console.log(`build-brand-assets: wrote public/brand/${name} (${size}px, ${out.length} bytes)`);
}

async function renderIco() {
  // Multi-size ICO: one tile rendered at each size.
  const sizes = [16, 24, 32, 48];
  const inputs = await Promise.all(
    sizes.map(async (s) => {
      const svg = Buffer.from(tileSvg('#f7f7f4'));
      return sharp(svg, { density: 96 * (s / 100) }).resize(s, s).png().toBuffer();
    }),
  );
  // Pack the PNGs into a valid .ico container.
  const pngs = inputs.map((b) => {
    const w = b.readUInt16BE(16);
    const h = b.readUInt16BE(18);
    return { png: b, w, h };
  });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4); // count
  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (const { png, w, h } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(w >= 256 ? 0 : w, 0); // width (0 = 256)
    e.writeUInt8(h >= 256 ? 0 : h, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(png.length, 8); // data size
    e.writeUInt32LE(offset, 12); // data offset
    entries.push(e);
    offset += png.length;
  }
  const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.png)]);
  writeFileSync(join(brandDir, 'favicon.ico'), ico);
  console.log(`build-brand-assets: wrote public/brand/favicon.ico (${ico.length} bytes, ${pngs.length} sizes)`);
}

await renderPng('icon-192.png', 192);
await renderPng('icon-512.png', 512);
await renderPng('apple-touch-icon.png', 180);
await renderIco();
console.log('build-brand-assets: done');