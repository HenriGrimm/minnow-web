/**
 * /feed.xml — site-level RSS feed of the changelog (spec §5.5).
 *
 * Reuses the same release data (src/data/releases.json) as /changelog/
 * and /changelog/rss.xml, but lives at the site root so crawlers and
 * readers find it where the standard expects. The changelog keeps its
 * own feed at /changelog/rss.xml for in-page link convenience.
 */
import { getReleases } from '../data/releases';
import { SITE } from '../data/site';
import type { APIContext } from 'astro';

const releases = getReleases();

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function oneLine(body: string): string {
  return body
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function feedXml(): string {
  const items = releases
    .map((release) => {
      const pubDate = release.publishedAt ? new Date(release.publishedAt).toUTCString() : '';
      const title = `v${release.version}${release.prerelease ? ' (beta)' : ''} — Minnow`;
      const link = `https://github.com/${SITE.repo}/releases/tag/v${release.version}`;
      const description = escapeXml(oneLine(release.body).slice(0, 300));
      return [
        '    <item>',
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${description}</description>`,
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
  return new Response(feedXml(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}