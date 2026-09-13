/**
 * build-llms-txt.mjs — generate the machine-readable LLM surface (spec §5.5).
 *
 *   node scripts/build-llms-txt.mjs
 *
 * Outputs (gitignored — never hand-edited, always regenerated):
 *   public/llms.txt       — plain-text product summary: what Minnow is,
 *                           where to get it, and a link map of the docs.
 *   public/llms-full.txt  — concatenated dump of every synced doc
 *                           (title + description + full markdown body),
 *                           in the order of the docs nav.
 *
 * The script depends on the synced content being present (src/content/docs,
 * populated by scripts/sync-minnow.mjs) and on src/data/releases.json
 * (populated by scripts/fetch-releases.mjs). It exits non-zero with a clear
 * message if either is missing, so CI can re-run the upstream scripts.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsBase = join(root, 'src', 'content', 'docs');
const releasesPath = join(root, 'src', 'data', 'releases.json');
const outDir = join(root, 'public');

// ---------------------------------------------------------------------------
// Frontmatter — the same shape the sync script injects (title, description).
// ---------------------------------------------------------------------------

function parseFrontmatter(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  if (!match) return { meta: {}, body: markdown };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

/** Recursively collect markdown files as { relPath, absolute } entries. */
function collectDocs(base) {
  const out = [];
  function walk(dir, rel = '') {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      const relPath = rel ? `${rel}/${entry}` : entry;
      if (statSync(abs).isDirectory()) {
        walk(abs, relPath);
      } else if (/\.md$/i.test(entry)) {
        out.push({ relPath, abs });
      }
    }
  }
  walk(base);
  // Deterministic order: by path.
  out.sort((a, b) => a.relPath.localeCompare(b.relPath, undefined, { numeric: true }));
  return out;
}

/** Strip a markdown body down to plain text for the link map. */
function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/`[^`\n]*`/g, ' ') // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links → label
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/^[-*+]\s+/gm, '') // list bullets
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

if (!existsSync(docsBase) || readdirSync(docsBase).length === 0) {
  console.error('build-llms: no synced docs found at src/content/docs — run `npm run sync:minnow` first.');
  process.exit(1);
}
if (!existsSync(releasesPath)) {
  console.error('build-llms: src/data/releases.json missing — run `npm run fetch:releases` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// llms.txt — plain-text product summary
// ---------------------------------------------------------------------------

const releases = JSON.parse(readFileSync(releasesPath, 'utf8'));
const latest = releases
  .filter((r) => !r.prerelease)
  .sort((a, b) => (Date.parse(b.publishedAt ?? '') || 0) - (Date.parse(a.publishedAt ?? '') || 0))[0];

const docs = collectDocs(docsBase);
// The docs link map is ordered by the nav tree (docs-nav.ts) so the reader
// sees manual → contributor → plugins → roadmap, not alphabetical.

async function loadNav() {
  // Import the TS nav via a tiny re-export so we don't pull in Astro.
  // docs-nav.ts is plain TS with no imports — a dynamic import via a
  // loader is overkill; instead we parse the `page:` entries by regex.
  const navSource = readFileSync(join(root, 'src', 'content', 'docs-nav.ts'), 'utf8');
  const pages = [...navSource.matchAll(/page:\s*'([^']+)'/g)].map((m) => m[1]);
  // De-duplicate, preserving order.
  const seen = new Set();
  const ordered = [];
  for (const p of pages) {
    if (!seen.has(p)) {
      seen.add(p);
      ordered.push(p);
    }
  }
  return ordered;
}

const orderedPages = await loadNav();
const byRelPath = new Map(docs.map((d) => [d.relPath, d]));

function docUrl(relPath) {
  // The doc routes are 1:1 with the file paths (minus .md) — README.md →
  // /docs/manual/README, matching src/pages/docs/[...slug].astro.
  return `https://minnow.sh/docs/${relPath.replace(/\.md$/i, '')}`;
}

const lines = [];
lines.push('# Minnow');
lines.push('');
lines.push(
  'Minnow is a full agentic development workspace that runs on your own computer: editor, agents, terminal, git, issues, planning, knowledge, and local model hosting in one app.'
);
lines.push('');
lines.push('## What it does');
lines.push(
  '- Drives code through chat: the agent edits files, runs tools, files issues, and makes branches in the same project.'
);
lines.push(
  '- Talks to models you host yourself (LM Studio, Ollama, llama-server, any OpenAI-compatible endpoint) or to cloud APIs if you give it a key.'
);
lines.push(
  '- Keeps your chats, notes, files, and credentials in a folder on your disk — nothing is uploaded to Minnow’s authors, and there is no telemetry.'
);
lines.push('- Runs on Windows, macOS (Apple Silicon + Intel), and Linux.');
lines.push('');
lines.push('## Get it');
lines.push('');
lines.push(
  latest
    ? `- Latest release: v${latest.version} — https://github.com/HenriGrimm/Minnow/releases/tag/v${latest.version}`
    : '- Latest release: https://github.com/HenriGrimm/Minnow/releases'
);
lines.push('- Changelog: https://minnow.sh/changelog/ (RSS: https://minnow.sh/feed.xml)');
lines.push('- Download page: https://minnow.sh/download');
lines.push('- Source: https://github.com/HenriGrimm/Minnow');
lines.push('- Docs: https://minnow.sh/docs');
lines.push('');
lines.push('## License');
lines.push(
  'Open source under the GNU AGPL-3.0 — https://www.gnu.org/licenses/agpl-3.0.html'
);
lines.push('');
lines.push('## Docs');
for (const relPath of orderedPages) {
  const doc = byRelPath.get(relPath);
  const url = docUrl(relPath);
  if (!doc) {
    lines.push(`- ${url}`);
    continue;
  }
  const { meta } = parseFrontmatter(readFileSync(doc.abs, 'utf8'));
  const title = meta.title && meta.title !== 'Untitled' ? meta.title : plainText(doc.relPath);
  const desc = meta.description ? ' — ' + plainText(meta.description).slice(0, 200) : '';
  lines.push(`- ${url} — ${title}${desc}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'llms.txt'), lines.join('\n') + '\n');
console.log(`build-llms: wrote public/llms.txt (${lines.length} lines)`);

// ---------------------------------------------------------------------------
// llms-full.txt — concatenated full docs dump
// ---------------------------------------------------------------------------

const fullLines = [];
fullLines.push('# Minnow — full docs dump');
fullLines.push('');
fullLines.push('Generated by scripts/build-llms-txt.mjs. Every synced doc, in nav order.');
fullLines.push('');

for (const relPath of orderedPages) {
  const doc = byRelPath.get(relPath);
  if (!doc) continue;
  const raw = readFileSync(doc.abs, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const title = meta.title || plainText(relPath);
  fullLines.push(`# ${title}`);
  fullLines.push(`Source: ${relPath}`);
  fullLines.push(`URL: ${docUrl(relPath)}`);
  if (meta.description) fullLines.push(`Description: ${meta.description}`);
  fullLines.push('');
  fullLines.push(body.replace(/\r?\n?$/, ''));
  fullLines.push('');
  fullLines.push('---');
  fullLines.push('');
}

writeFileSync(join(outDir, 'llms-full.txt'), fullLines.join('\n') + '\n');
console.log(`build-llms: wrote public/llms-full.txt (${fullLines.length} lines)`);