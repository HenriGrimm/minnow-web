/*
 * sync-minnow.mjs — pull vendorable content from the Minnow repo.
 *
 *   node scripts/sync-minnow.mjs --repo HenriGrimm/Minnow --ref main
 *
 * Extracts:
 *   src/styles/tokens.css      → src/styles/vendor/tokens.css  (banner + documented 4-token patch)
 *   documentation/manual/**        (all markdown)
 *   documentation/contributor/**   (all markdown)
 *   documentation/plugins/**       (all markdown)
 *       → src/content/docs/**      (injected frontmatter: title from H1,
 *                                description from first paragraph; relative
 *                                links → /docs/...; image paths rewritten)
 *   documentation/ROADMAP.md       → src/content/docs/roadmap.md
 *   documentation/images/*.png → src/assets/screenshots/       (skip app-research.png)
 *   public/logos/**            → public/brand/
 *
 * The token file is vendored with the one documented patch (spec §3.1): the
 * four --mn-syntax-* tokens are appended to the human-dark and mint-dark
 * blocks — the only two of the 16 that omit them upstream.
 *
 * Guards, each failing the sync loudly (spec §7.5):
 *   - a docs-nav.ts entry with no matching synced file, or a synced file
 *     absent from the nav;
 *   - a doc or site string mentioning a release-gated surface (Research,
 *     Experts, Benchmarking, Compare, Super Plan) outside the explicit
 *     allowlist (src/content/docs-nav.ts GATED_SURFACE_ALLOWLIST);
 *   - tokens.css not containing all 16 [data-theme=...] blocks;
 *   - any internal doc link pointing at a file that is not synced.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { repo: 'HenriGrimm/Minnow', ref: 'main' };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--repo' && argv[i + 1]) args.repo = argv[++i];
    else if (key === '--ref' && argv[i + 1]) args.ref = argv[++i];
  }
  return args;
}

function fatal(msg) {
  console.error(`sync-minnow: FATAL — ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Gated-surface detection
// ---------------------------------------------------------------------------
//
// A "gated surface" is one of Research, Experts, Benchmarking, Compare, or
// Super Plan. The docs must not reference these surfaces outside the explicit
// allowlist (src/content/docs-nav.ts GATED_SURFACE_ALLOWLIST).
//
// Patterns: "Super Plan" and "Benchmarking" are unambiguous. "Compare",
// "Experts", and "Research" can be ordinary words, so the helper checks
// word-boundary capitalization and excludes common false-positive forms
// (e.g. "researcher", "expert-panel", a lowercase "compare", etc.).

/**
 * Find gated-surface mentions in a single line of markdown. Returns the list
 * of surface names mentioned (e.g. ['Compare', 'Super Plan']). A mention is
 * a capitalized word at a word boundary that is not part of a known
 * false-positive form.
 */
function findGatedSurfaceMentions(line) {
  const mentions = [];
  // Unambiguous: "Super Plan" and "Benchmarking" (case-sensitive).
  if (/\bSuper\s+Plan\b/.test(line)) mentions.push('Super Plan');
  if (/\bBenchmarking\b/.test(line)) mentions.push('Benchmarking');

  // "Compare" — must be capitalized and not lowercase "compare"/"compared".
  for (const m of line.matchAll(/\bCompare\b/g)) {
    // Exclude if it's part of "Compared"/"comparing" etc. (word boundary
    // already excludes those). Capitalized "Compare" = the surface.
    mentions.push('Compare');
    break; // one per line is enough for the guard
  }

  // "Experts" — capitalized, but exclude "expert-panel" (a shipped role name).
  if (/\bExperts\b/.test(line) && !/\bexpert-panel\b/i.test(line)) {
    mentions.push('Experts');
  }

  // "Research" — capitalized, but exclude "researcher" (an agent type),
  // "Research worker" (a sub-agent type), and "research" as a lowercase
  // ordinary word (e.g. "code research", "deep research").
  if (/\bResearch\b/.test(line) && !/\bresearcher\b/i.test(line) && !/\bResearch\s+worker\b/i.test(line)) {
    mentions.push('Research');
  }

  return mentions;
}

// ---------------------------------------------------------------------------
// Docs transform
// ---------------------------------------------------------------------------

/**
 * Extract (title, description) from markdown. Title = the H1. Description =
 * the first paragraph of prose after the H1 (skipping headings, lists,
 * tables, code fences, and blank lines).
 */
function extractFrontmatter(md) {
  const lines = md.split('\n');
  let title = null;
  let titleLine = -1;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    if (h1 && title === null) {
      title = h1[1];
      titleLine = i;
      break;
    }
  }
  if (title === null) {
    title = 'Untitled';
  }
  let description = '';
  if (titleLine >= 0) {
    let inFence2 = false;
    for (let i = titleLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*```/.test(line)) {
        inFence2 = !inFence2;
        continue;
      }
      if (inFence2) continue;
      if (line.trim() === '') continue; // skip blank until prose
      // Stop at the first non-prose element: heading, list, table, blockquote.
      if (/^#{1,6}\s/.test(line) || /^\s*[-*+]\s/.test(line) || /^\s*\|/.test(line) || /^\s*>\s?/.test(line)) {
        break;
      }
      // This is a prose line. Collect it (and any continuation until blank).
      description = line.trim();
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j];
        if (next.trim() === '') break;
        if (/^#{1,6}\s/.test(next) || /^\s*[-*+]\s/.test(next) || /^\s*\|/.test(next)) break;
        description += ' ' + next.trim();
        j++;
      }
      break;
    }
  }
  // Strip inline markdown formatting for a clean description.
  description = description
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
  return { title, description };
}

/**
 * Rewrite a doc body: relative links → /docs/<resolved>, external links kept,
 * internal anchor links kept, and image paths rewritten to the public
 * docs-assets path.
 */
function rewriteBody(body, sourceRel, syncedSubtrees) {
  const lines = body.split('\n');
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    // Rewrite [text](target) links and ![alt](target) images.
    const rewritten = line.replace(/(!?\[[^\]]*\])\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (whole, prefix, target) => {
      const newTarget = rewriteTarget(target, sourceRel, syncedSubtrees);
      if (newTarget === target) return whole;
      return `${prefix}(${newTarget})`;
    });
    out.push(rewritten);
  }
  return out.join('\n');
}

/**
 * Resolve a link target relative to the source doc. Returns the new target:
 *  - external (http/https/mailto) → unchanged
 *  - pure anchor (#...) → unchanged
 *  - absolute internal (/docs/...) → unchanged
 *  - relative .md → /docs/<resolved path>  (+ anchor preserved)
 *  - relative non-md (e.g. source code files) → GitHub permalink
 *  - image → /docs-assets/<resolved name>
 */
function rewriteTarget(target, sourceRel, syncedSubtrees) {
  // Split off an anchor.
  const hashIdx = target.indexOf('#');
  const anchor = hashIdx >= 0 ? target.slice(hashIdx) : '';
  const pathPart = hashIdx >= 0 ? target.slice(0, hashIdx) : target;

  // Pure anchor (no path).
  if (pathPart === '') return target;

  // External or protocol link.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart)) return target;

  // Already an absolute site path.
  if (pathPart.startsWith('/')) return target;

  // It's a relative path. Resolve it against the source doc's directory.
  const srcDir = dirname(sourceRel);
  const resolved = normalizePath(join(srcDir, pathPart));

  // GitHub repo permalink for source-code / non-doc links.
  if (!resolved.toLowerCase().endsWith('.md')) {
    return `https://github.com/HenriGrimm/Minnow/blob/main/${resolved}${anchor}`;
  }

  // Image reference → public docs-assets path.
  if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(resolved)) {
    return `/docs-assets/${resolved.split('/').pop()}${anchor}`;
  }

  // .md link that resolves outside the synced subtrees → GitHub permalink.
  // e.g. ../context.md, ../../DESIGN.md, ../maintainer/releasing.md
  const topDir = resolved.split('/')[0];
  if (!syncedSubtrees.includes(topDir)) {
    return `https://github.com/HenriGrimm/Minnow/blob/main/${resolved}${anchor}`;
  }

  // Markdown doc → /docs/ path (strip .md, anchor preserved).
  const docPath = resolved.replace(/\.md$/i, '');
  return `/docs/${docPath}${anchor}`;
}

/**
 * Normalize a filesystem path: resolve ./ and ../ segments, use forward
 * slashes. Mirrors the manual's relative-link structure.
 */
function normalizePath(p) {
  const parts = p.replace(/\\/g, '/').split('/');
  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

/**
 * Sync one markdown file: read, extract frontmatter, rewrite body, write to
 * the destination under src/content/docs.
 */
function syncDoc(sourceAbs, destAbs, sourceRel, syncedSubtrees) {
  const md = readFileSync(sourceAbs, 'utf8');
  const { title, description } = extractFrontmatter(md);
  const body = rewriteBody(md, sourceRel, syncedSubtrees);
  const frontmatter =
    `---\n` +
    `title: ${JSON.stringify(title)}\n` +
    `description: ${JSON.stringify(description)}\n` +
    `---\n\n`;
  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, frontmatter + body, 'utf8');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const { repo, ref } = parseArgs(process.argv.slice(2));

const tarballUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.tar.gz`;
const work = join(tmpdir(), `minnow-sync-${Date.now()}`);
mkdirSync(work, { recursive: true });

console.log(`sync-minnow: downloading ${tarballUrl}`);
const tarPath = join(work, 'repo.tar.gz');
execSync(`curl -fsL --retry 3 -o ${JSON.stringify(tarPath)} ${JSON.stringify(tarballUrl)}`, {
  stdio: 'inherit',
});

const archive = join(work, 'repo');
execSync(
  `mkdir ${JSON.stringify(archive)} && tar -xzf ${JSON.stringify(tarPath)} -C ${JSON.stringify(archive)} --strip-components 1`,
  { stdio: 'inherit' },
);

// --- src/styles/tokens.css → src/styles/vendor/tokens.css --------------------

const sourceTokensPath = join(archive, 'src', 'styles', 'tokens.css');
if (!existsSync(sourceTokensPath)) {
  fatal('src/styles/tokens.css not found in the archive');
}

// The documented patch (spec §3.1): human-dark and mint-dark are the only two
// of the 16 blocks that omit the four --mn-syntax-* tokens. Append them just
// before the closing brace of each block. No-op if upstream ships them already.
const syntaxPatch = [
  '  --mn-syntax-command: var(--mn-accent);',
  '  --mn-syntax-name: var(--mn-accent);',
  '  --mn-syntax-inline: var(--mn-fg);',
  '  --mn-syntax-link: var(--mn-accent);',
];

function singleSelectorBlock(css, themeId) {
  const re = new RegExp(
    `:root\\[data-theme="${themeId}"\\],\\s*\\.settings-theme-preview\\[data-theme="${themeId}"\\](\\s*\\{[\\s\\S]*?\\n\\})`,
  );
  const match = css.match(re);
  if (!match) return css;
  return css.replace(match[0], `:root[data-theme="${themeId}"]${match[1]}`);
}

function applySyntaxPatch(css, themeId) {
  const re = new RegExp(`(:root\\[data-theme="${themeId}"\\]\\s*\\{)([\\s\\S]*?)(\\n\\})`);
  const match = css.match(re);
  if (!match) {
    fatal(`could not locate the ${themeId} theme block for the --mn-syntax-* patch`);
  }
  if (match[2].includes('--mn-syntax-command')) return css;
  return css.replace(match[0], `${match[1]}${match[2]}\n${syntaxPatch.join('\n')}${match[3]}`);
}

let tokens = readFileSync(sourceTokensPath, 'utf8');
for (const themeId of [...themes_from(tokens)]) {
  tokens = singleSelectorBlock(tokens, themeId);
}
tokens = applySyntaxPatch(tokens, 'human-dark');
tokens = applySyntaxPatch(tokens, 'mint-dark');

function themes_from(css) {
  return new Set([...css.matchAll(/\[data-theme="([^"]+)"\]/g)].map((m) => m[1]));
}

// Guard: all 16 theme blocks present after patching.
const themes = new Set([...tokens.matchAll(/\[data-theme="([^"]+)"\]/g)].map((m) => m[1]));
if (themes.size !== 16) {
  fatal(
    `vendored tokens.css has ${themes.size} distinct [data-theme=...] blocks, expected 16: ${[...themes].join(', ')}`,
  );
}
console.log(
  'sync-minnow: applied the documented --mn-syntax-* patch to human-dark + mint-dark; verified all 16 [data-theme=...] blocks',
);

const banner = `/* stylelint-disable */
/*
 * Generated by scripts/sync-minnow.mjs from ${repo} @ ${ref}.
 * VERBATIM copy of src/styles/tokens.css — DO NOT EDIT.
 * Re-run \`npm run sync:minnow\` to refresh.
 *
 * Documented patch applied (spec §3.1): the four --mn-syntax-* tokens are
 * appended to the human-dark and mint-dark blocks, the only two that omit
 * them upstream.
 */
`;

const vendorDir = join(root, 'src', 'styles', 'vendor');
mkdirSync(vendorDir, { recursive: true });
writeFileSync(join(vendorDir, 'tokens.css'), banner + tokens);
console.log('sync-minnow: wrote src/styles/vendor/tokens.css');

// --- documentation → src/content/docs ----------------------------------------

const docsDestDir = join(root, 'src', 'content', 'docs');
// Wipe the docs dest so a deleted upstream doc doesn't linger.
rmSync(docsDestDir, { recursive: true, force: true });
mkdirSync(docsDestDir, { recursive: true });

// The docs subtrees to sync (relative to documentation/).
const DOCS_SUBTREES = ['manual', 'contributor', 'plugins'];
const syncedFiles = []; // relative paths under src/content/docs (e.g. manual/README.md)

function findMarkdownFiles(dir, relBase) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;
    const abs = join(dir, entry.name);
    const rel = join(relBase, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(abs, rel));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push({ abs, rel });
    }
  }
  return results;
}

for (const subtree of DOCS_SUBTREES) {
  const srcDir = join(archive, 'documentation', subtree);
  const files = findMarkdownFiles(srcDir, subtree);
  for (const { abs, rel } of files) {
    // rel is the docs-relative path (e.g. manual/get-started/install.md)
    const destAbs = join(docsDestDir, rel);
    syncDoc(abs, destAbs, rel, DOCS_SUBTREES);
    syncedFiles.push(rel);
  }
  console.log(`sync-minnow: synced ${files.length} docs in ${subtree}/`);
}

// ROADMAP.md → src/content/docs/roadmap.md (single file, not a subtree).
const roadmapSrc = join(archive, 'documentation', 'ROADMAP.md');
if (existsSync(roadmapSrc)) {
  const destAbs = join(docsDestDir, 'roadmap.md');
  syncDoc(roadmapSrc, destAbs, 'roadmap.md', DOCS_SUBTREES);
  syncedFiles.push('roadmap.md');
  console.log('sync-minnow: synced ROADMAP.md → src/content/docs/roadmap.md');
} else {
  fatal('documentation/ROADMAP.md not found in the archive');
}

// --- guards: nav validation, gated-surface allowlist, internal links --------

// 1. Load the docs-nav.ts (nav + allowlist). Parse the page entries and the
//    GATED_SURFACE_ALLOWLIST out of the TS file (the file is hand-maintained
//    TS, not compiled by this script).
const navPath = join(root, 'src', 'content', 'docs-nav.ts');
if (!existsSync(navPath)) {
  fatal('src/content/docs-nav.ts not found — the nav tree must exist for validation');
}
const navTs = readFileSync(navPath, 'utf8');

// Extract every `page: '...'` entry.
const navPages = [...navTs.matchAll(/page:\s*'([^']+)'/g)].map((m) => m[1]);
// Extract the GATED_SURFACE_ALLOWLIST array entries.
const allowlistMatch = navTs.match(/GATED_SURFACE_ALLOWLIST:\s*string\[\]\s*=\s*\[([\s\S]*?)\]/);
const gatedAllowlist = allowlistMatch
  ? [...allowlistMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  : [];

// 2. Nav validation: every nav page must match a synced file, and every
//    synced file must appear in the nav.
const syncedSet = new Set(syncedFiles);
const navPageSet = new Set(navPages);
const navMissingFiles = navPages.filter((p) => !syncedSet.has(p));
const filesMissingNav = syncedFiles.filter((f) => !navPageSet.has(f));
if (navMissingFiles.length > 0) {
  fatal(
    `docs-nav.ts has entries with no matching synced file: ${navMissingFiles.join(', ')}`,
  );
}
if (filesMissingNav.length > 0) {
  fatal(`synced docs are absent from docs-nav.ts: ${filesMissingNav.join(', ')}`);
}
console.log(
  `sync-minnow: nav validation passed — ${navPages.length} nav entries match ${syncedFiles.length} synced files`,
);

// 3. Gated-surface allowlist: no synced doc may mention a gated surface
//    unless it is on the allowlist.
const gatedViolations = [];
for (const rel of syncedFiles) {
  const abs = join(docsDestDir, rel);
  const md = readFileSync(abs, 'utf8');
  const allowed = gatedAllowlist.includes(rel);
  const lines = md.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const term of findGatedSurfaceMentions(lines[i])) {
      if (!allowed) {
        gatedViolations.push(`${rel}:${i + 1} mentions "${term}"`);
      }
    }
  }
}
if (gatedViolations.length > 0) {
  fatal(
    `docs mention release-gated surfaces outside the allowlist: ${gatedViolations.join('; ')}`,
  );
}
console.log('sync-minnow: gated-surface allowlist passed — no disallowed mentions');

// 4. Internal link 404 check: every internal /docs/... link in a synced doc
//    that points to a synced subtree must resolve to a synced file. Links
//    that point outside the synced subtrees (e.g. /docs/context, /docs/DESIGN)
//    are skipped — they were rewritten to GitHub permalinks by the transform,
//    so any remaining /docs/ link to them would be a bug in the transform.
const brokenLinks = [];
for (const rel of syncedFiles) {
  const abs = join(docsDestDir, rel);
  const md = readFileSync(abs, 'utf8');
  const lines = md.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const linkTargets = [...lines[i].matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
    for (const target of linkTargets) {
      const hashIdx = target.indexOf('#');
      const pathPart = hashIdx >= 0 ? target.slice(0, hashIdx) : target;
      if (!pathPart.startsWith('/docs/')) continue; // external / anchor / asset
      const docPath = pathPart.slice('/docs/'.length);
      // Skip links outside the synced subtrees (they should have been
      // rewritten to GitHub by the transform, but be lenient here).
      const topDir = docPath.split('/')[0];
      if (!DOCS_SUBTREES.includes(topDir)) continue;
      // The doc file would be /docs/<docPath>.md
      const candidate = `${docPath}.md`;
      if (!syncedSet.has(candidate)) {
        brokenLinks.push(`${rel} → ${target} (no synced file ${candidate})`);
      }
    }
  }
}
if (brokenLinks.length > 0) {
  fatal(`internal doc links 404: ${brokenLinks.join('; ')}`);
}
console.log('sync-minnow: internal link check passed — no 404s');

// --- documentation/images/*.png → src/assets/screenshots/ --------------------

const imagesDir = join(archive, 'documentation', 'images');
const shotsDir = join(root, 'src', 'assets', 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(imagesDir)) {
  const pngs = readdirSync(imagesDir).filter((n) => n.endsWith('.png'));
  const skipped = [];
  let copied = 0;
  for (const name of pngs) {
    if (name === 'app-research.png') {
      skipped.push(name);
      continue; // gated app — never shipped to the site
    }
    cpSync(join(imagesDir, name), join(shotsDir, name));
    copied++;
  }
  console.log(
    `sync-minnow: synced ${copied} screenshots to src/assets/screenshots (skipped: ${skipped.join(', ') || 'none'})`,
  );
} else {
  console.log('sync-minnow: no documentation/images in archive, skipped');
}

// --- public/logos/** → public/brand/ ------------------------------------------
const SITE_BRAND_FILES = ['favicon.svg', 'glyph-black.svg', 'lockup-horizontal.svg'];
const brandDir = join(root, 'public', 'brand');
const siteBrandTmp = join(root, 'public', '_site-brand');
const keptBrand = [];
if (existsSync(brandDir)) {
  for (const name of SITE_BRAND_FILES) {
    const from = join(brandDir, name);
    if (existsSync(from)) {
      const to = join(siteBrandTmp, name);
      mkdirSync(siteBrandTmp, { recursive: true });
      renameSync(from, to);
      keptBrand.push(name);
    }
  }
}
const logosDir = join(archive, 'public', 'logos');
if (existsSync(logosDir)) {
  rmSync(brandDir, { recursive: true, force: true });
  cpSync(logosDir, brandDir, { recursive: true });
  console.log('sync-minnow: synced public/logos → public/brand');
} else {
  mkdirSync(brandDir, { recursive: true });
  console.log('sync-minnow: no public/logos in archive, skipped');
}
for (const name of keptBrand) {
  renameSync(join(siteBrandTmp, name), join(brandDir, name));
}
if (existsSync(siteBrandTmp)) {
  rmSync(siteBrandTmp, { recursive: true, force: true });
}
console.log(`sync-minnow: preserved ${keptBrand.length} site-authored brand SVG(s)`);

// --- cleanup -------------------------------------------------------------------

rmSync(work, { recursive: true, force: true });
console.log('sync-minnow: done');