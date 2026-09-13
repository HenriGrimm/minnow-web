/**
 * /changelog/rss.xml — spec §6.5. RSS 2.0 feed of the changelog, generated
 * at build time from the same release data the page uses (W6-A data layer).
 * Each item: release notes as <description> (HTML), GitHub tag as <link>.
 *
 * Static output: Astro resolves this to dist/changelog/rss.xml, so the
 * <link> must be absolute (Site.url).
 */
import { getReleases } from '../../data/releases';
import type { Release } from '../../data/releases';
import { SITE } from '../../data/site';
import type { APIContext } from 'astro';

const releases = getReleases();

/** Escape for XML text/attribute context. */
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Collapse a markdown body to a single line for the feed description. */
function oneLine(body: string): string {
  return body
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Plain-text (no CDATA, no HTML) one-liner of the release notes. */
function itemDescription(release: Release): string {
  const lead = oneLine(release.body).slice(0, 300);
  return escapeXml(lead);
}

function rssXml(): string {
  const items = releases
    .map((release) => {
      const pubDate = release.publishedAt ? new Date(release.publishedAt).toUTCString() : '';
      const title = `v${release.version}${release.prerelease ? ' (beta)' : ''} — Minnow`;
      const link = `https://github.com/${SITE.repo}/releases/tag/v${release.version}`;
      return [
        '    <item>',
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${itemDescription(release)}</description>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Minnow — Changelog</title>
    <link>${SITE.url}/changelog/</link>
    <description>Release notes for Minnow, the agentic development workspace.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;
}

export function GET(_context: APIContext) {
  const xml = rssXml();
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}