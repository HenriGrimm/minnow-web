/*
 * fetch-releases.mjs — pull GitHub releases for the Minnow app into
 * src/data/releases.json (consumed by src/data/releases.ts).
 *
 *   node scripts/fetch-releases.mjs [--repo HenriGrimm/Minnow]
 *
 * Unauthenticated GitHub API (60 req/hr). On rate-limit or network failure
 * the script exits non-zero with a clear message so CI can re-run.
 *
 * Asset names are normalized to platform ids matching
 * src/scripts/platform.ts (win-x64 / darwin-arm64 / darwin-x64 / linux):
 *   *-setup-*.exe        → win-x64   (NSIS installer)
 *   *-arm64.dmg, *-aarch64.dmg → darwin-arm64
 *   *-x64.dmg, *-mac.dmg  → darwin-x64
 *   *.AppImage           → linux
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PATH = join(root, 'src', 'data', 'releases.json');

function parseArgs(argv) {
  const args = { repo: 'HenriGrimm/Minnow' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--repo' && argv[i + 1]) args.repo = argv[++i];
  }
  return args;
}

function fatal(msg) {
  console.error(`fetch-releases: FATAL — ${msg}`);
  process.exit(1);
}

function normalizePlatform(assets, asset) {
  const name = asset.name;
  const lower = name.toLowerCase();
  if (lower.endsWith('.exe')) {
    // NSIS setup installer: <app>-<ver>-setup-*.exe or <app>_x64.exe
    if (/\bx64\b|windows|win/i.test(name) || /-setup-|-setup\./.test(lower) || !/\barm64\b/i.test(name)) {
      return 'win-x64';
    }
  } else if (lower.endsWith('.dmg')) {
    if (/\barm64\b|aarch64|silicon/i.test(name)) return 'darwin-arm64';
    if (/\bx64\b|\bx86_64\b|intel/i.test(name)) return 'darwin-x64';
    // unlabeled dmg: first wins as x64, second as arm64
    const hasArm = assets.some((a) => a.name !== name && a.name.toLowerCase().endsWith('.dmg'));
    return hasArm ? 'darwin-x64' : 'darwin-arm64';
  } else if (lower.endsWith('.appimage')) {
    return 'linux';
  }
  return null;
}

async function fetchJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    fatal(`network failure fetching ${url}: ${err.message}. CI re-run should resolve transient errors.`);
  }
  const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
  const rateLimitReset = res.headers.get('x-ratelimit-reset');
  if (res.status === 403 || res.status === 429) {
    fatal(
      `GitHub API rate-limited (HTTP ${res.status}). ` +
        (rateLimitReset
          ? `Reset at epoch ${rateLimitReset}. `
          : '') +
        'Re-run "npm run fetch:releases" after the reset window, or set a GITHUB_TOKEN for a higher limit.'
    );
  }
  if (!res.ok) fatal(`GitHub API error (HTTP ${res.status}) for ${url}: ${(await res.text()).slice(0, 300)}`);
  void rateLimitRemaining;
  return res.json();
}

function parseVersion(raw) {
  const m = /v?(\d+\.\d+\.\d+(?:[-+][0-9a-zA-Z.-]+)?)/.exec(raw ?? '');
  return m ? m[1] : (raw ?? '').replace(/^v/, '');
}

const { repo } = parseArgs(process.argv.slice(2));

const base = `https://api.github.com/repos/${repo}`;

console.log(`fetch-releases: fetching ${base}/releases (paginated)`);
const releases = [];
let page = 1;
while (true) {
  const batch = await fetchJson(`${base}/releases?page=${page}&per_page=100`);
  releases.push(...batch);
  if (batch.length < 100) break;
  page += 1;
  if (page > 20) fatal('more than 20 pages of releases — aborting pagination.');
}

const seen = new Set();
const out = releases
  .filter((r) => r.tag_name && !seen.has(r.tag_name) && seen.add(r.tag_name))
  .map((r) => {
    const version = parseVersion(r.tag_name);
    const assets = (r.assets ?? []).map((a) => ({
      name: a.name,
      platform: normalizePlatform(r.assets ?? [], a),
      url: a.browser_download_url,
      size: a.size ?? null,
      digest: a.digest ?? null,
    }));
    return {
      version,
      name: r.name ?? r.tag_name,
      publishedAt: r.published_at ?? r.created_at ?? null,
      prerelease: Boolean(r.prerelease),
      body: r.body ?? '',
      assets,
    };
  });

if (out.length === 0) fatal(`no releases found for ${repo}.`);

// newest first by published date, then version
const byNewest = [...out].sort((a, b) => {
  const ta = Date.parse(a.publishedAt ?? '') || 0;
  const tb = Date.parse(b.publishedAt ?? '') || 0;
  if (ta !== tb) return tb - ta;
  return b.version.localeCompare(a.version, undefined, { numeric: true });
});

console.log(`fetch-releases: ${byNewest.length} release(s); latest = ${byNewest[0].version}`);
console.log(`fetch-releases: writing ${OUT_PATH}`);
mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(byNewest, null, 2) + '\n');
