/**
 * og.ts — shared OG-image generation via astro-og-canvas (spec §5.4).
 *
 * Every card renders in the site's default theme, human-dark:
 *   bg #0f0f0f → #141414   (a faint surface-0 lift)
 *   title   #ffdbbd        (--mn-fg)
 *   tagline #a89482        (--mn-fg-muted)
 *   glyph   #d27428        (--mn-accent), as the card logo
 *
 * Type is the site's own type: Inter is the sans face the UI ships
 * (--font-ui is a system stack; Inter is the concrete brand face, and the
 * same files ship in public/fonts for canvas rendering).
 */
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateOpenGraphImage } from 'astro-og-canvas';
import type { OGImageOptions } from 'astro-og-canvas';
import { SITE } from '../data/site';

// At build time the compiled page runs from dist/pages/..., so the project
// root is two levels up — but only when the file is present (it is; the
// fonts are committed). Resolve defensively: prefer the source tree when
// the fonts exist there, else fall back to the dist copy of public/.
const here = path.dirname(fileURLToPath(import.meta.url));
function findRoot(): string {
  for (const candidate of [
    path.resolve(here, '..'), // source tree (dev)
    path.resolve(here, '..', '..', '..', '..'), // dist/pages → project root (build)
    process.cwd(),
  ]) {
    if (existsSync(path.join(candidate, 'public', 'fonts', 'Inter-Regular.ttf'))) {
      return candidate;
    }
  }
  return process.cwd();
}
const root = findRoot();
const publicDir = existsSync(path.join(root, 'public', 'fonts', 'Inter-Regular.ttf'))
  ? path.join(root, 'public')
  : path.join(root, 'dist', 'pages', 'public');
const fonts = [
  path.join(publicDir, 'fonts', 'Inter-Regular.ttf'),
  path.join(publicDir, 'fonts', 'Inter-SemiBold.ttf'),
];

const glyph = path.join(publicDir, 'brand', 'minnow-glyph-white.svg');

/** Base card options for a given page path. */
export function ogOptions(pagePath: string, description?: string): OGImageOptions {
  return {
    cacheDir: path.join(root, 'node_modules', '.astro-og-canvas'),
    title: `minnow.sh — ${pagePath.replace(/^\//, '').replace(/\/+$/, '') || 'home'}`,
    description: description ?? undefined,
    logo: { path: glyph, size: [96] },
    bgGradient: [
      [15, 15, 15], // #0f0f0f — human-dark --mn-bg
      [20, 20, 20], // #141414 — human-dark --mn-surface-0
    ],
    font: {
      title: {
        color: [255, 219, 189], // --mn-fg
        size: 64,
        weight: 'SemiBold',
        families: ['Inter'],
      },
      description: {
        color: [168, 148, 130], // --mn-fg-muted
        size: 38,
        lineHeight: 1.4,
        families: ['Inter'],
      },
    },
    fonts,
    format: 'JPEG',
    quality: 88,
  };
}

/**
 * Image + headers for one page. The title is shaped for the card
 * ("minnow.sh — <label>"); the caller passes its own <title>/meta.
 */
export async function ogImage(
  pagePath: string,
  description?: string
): Promise<{ body: BodyInit; contentType: string }> {
  const body = await generateOpenGraphImage(ogOptions(pagePath, description));
  return { body, contentType: 'image/jpeg' };
}

/** Absolute OG image URL for a page, for <meta property="og:image">. */
export function ogImageUrl(pagePath: string): string {
  return `${SITE.url}/og/${pagePath.replace(/^\//, '').replace(/\/+$/, '') || 'index'}.jpg`;
}