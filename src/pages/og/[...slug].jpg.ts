/**
 * /og/[...slug].jpg — per-page OG images (spec §5.4), generated at build
 * time with astro-og-canvas in the site's human-dark colours.
 *
 * Slugs are the page paths:
 *   /           → /og/index.jpg
 *   /download   → /og/download.jpg
 *   /icons      → /og/icons.jpg
 *   /privacy    → /og/privacy.jpg
 *   /changelog  → /og/changelog.jpg
 *   /docs/<...> → /og/docs/<...>.jpg  (every synced doc)
 */
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { ogImage } from '../../lib/og';

/** One card per page; docs come from the docs collection. */
const PAGES: Array<{ slug: string; title: string; description?: string }> = [
  {
    slug: 'index',
    title: 'Minnow — the agentic development workspace',
    description: 'Open source, and completely yours. Runs on Windows, macOS, and Linux.',
  },
  {
    slug: 'download',
    title: 'Download Minnow',
    description: 'Installers for Windows, macOS (Apple Silicon + Intel), and Linux.',
  },
  {
    slug: 'icons',
    title: 'Minnow — the icon set',
    description: 'The glyph and the UI icon set, free for your own projects.',
  },
  {
    slug: 'privacy',
    title: 'Minnow — privacy',
    description: 'Your chats, notes, files, and credentials stay on your disk.',
  },
  {
    slug: 'changelog',
    title: 'Minnow — changelog',
    description: 'Release notes for Minnow, the agentic development workspace.',
  },
];

/** Shape a doc slug for its card ("minnow.sh — <title>"). */
function docCard(doc: { title?: string; description?: string; id: string }): {
  slug: string;
  title: string;
  description?: string;
} {
  const rawLabel =
    doc.title && doc.title !== 'Untitled'
      ? doc.title
      : doc.id.replace(/\.md$/i, '').split('/').pop() ?? 'docs';
  const label = rawLabel.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const desc = doc.description ? doc.description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180) : undefined;
  return { slug: `docs/${doc.id.replace(/\.md$/i, '')}`, title: label, description: desc };
}

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  const all = [...PAGES, ...docs.map(docCard)];
  return all.map((p) => ({
    params: { slug: p.slug },
    props: p,
  }));
}

export async function GET(context: APIContext) {
  const { title, description } = context.props as {
    slug: string;
    title: string;
    description?: string;
  };
  const { body, contentType } = await ogImage(title, description);
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}