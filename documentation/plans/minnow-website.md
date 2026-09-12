---
name: minnow-website
overview: "Build minnow.sh — the marketing + docs website for the Minnow app — in this (currently empty) workspace as a static Astro 5 + Tailwind v4 site. The site reuses Minnow's verbatim --mn-* token file (synced from HenriGrimm/Minnow), ships all 16 themes with a live switcher, renders the app shell as live DOM (not screenshots) for the hero, and syncs documentation at build time. Converted from documentation/plans/Website Plan.md into orchestrator-board waves: scaffold → design system → app-frame replica → static home → motion → download/changelog → docs → polish/ship."
todos:
  - id: W1-A
    content: "Wave 1: Repo scaffold — Astro 5 + Tailwind v4 + configs + placeholder page"
    status: pending
  - id: W2-A
    content: "Wave 2: Design tokens — vendor/tokens.css, tokens.site.css, base.css, stylelint hex guard, sync-minnow.mjs"
    status: pending
  - id: W2-B
    content: "Wave 2: Theme runtime — theme.ts, flash guard IIFE, theme-transitions.css"
    status: pending
  - id: W2-C
    content: "Wave 2: Site chrome + shared components — Nav, Footer, ThemeSwitcher, Button, Card, RowList, CodeBlock, Accordion, Eyebrow, Section, Reveal"
    status: pending
  - id: W2-D
    content: "Wave 2: Content data files — site, providers, apps, replaces, themes, faq"
    status: pending
  - id: W3-A
    content: "Wave 3: Icon set + brand marks — inline SVGs, glyph, favicon set"
    status: pending
  - id: W3-B
    content: "Wave 3: AppFrame replica — 7 subcomponents + app-frame.css"
    status: pending
  - id: W4-A
    content: "Wave 4: Home §0 Hero + platform detection + copy button"
    status: pending
  - id: W4-B
    content: "Wave 4: Home §1 Runs-on + §2 Seams (static)"
    status: pending
  - id: W4-C
    content: "Wave 4: Home §3 Build loop (static) + §4 What it replaces"
    status: pending
  - id: W4-D
    content: "Wave 4: Home §5 App deep-dives + §6 Models + §7 Agents & tools bento"
    status: pending
  - id: W4-E
    content: "Wave 4: Home §8 Open at the seams + §9 Themes switcher + §10–§12"
    status: pending
  - id: W4-F
    content: "Wave 4: Home §13 FAQ + §14 Final CTA + index assembly + footer columns + content audit"
    status: pending
  - id: W5-A
    content: "Wave 5: motion.ts reveal primitive + reduced-motion + visibility park"
    status: pending
  - id: W5-B
    content: "Wave 5: Hero load sequence (hero.ts)"
    status: pending
  - id: W5-C
    content: "Wave 5: Seam diagram scroll scrub (seams.ts)"
    status: pending
  - id: W5-D
    content: "Wave 5: Pinned build-loop section (build-loop.ts)"
    status: pending
  - id: W5-E
    content: "Wave 5: Quick Edit demo + tools-permission demo"
    status: pending
  - id: W6-A
    content: "Wave 6: fetch-releases.mjs + releases data layer"
    status: pending
  - id: W6-B
    content: "Wave 6: /download page — platform detect, missing-asset fallback, per-platform notes"
    status: pending
  - id: W6-C
    content: "Wave 6: /changelog + RSS"
    status: pending
  - id: W7-A
    content: "Wave 7: Docs sync transforms + content collections + docs-nav validation"
    status: pending
  - id: W7-B
    content: "Wave 7: Docs layout — 3-pane Docs.astro + prose.css + [...slug].astro"
    status: pending
  - id: W7-C
    content: "Wave 7: Pagefind search + Ctrl/Cmd+K"
    status: pending
  - id: W8-A
    content: "Wave 8: OG images, llms.txt, robots/sitemap/feed"
    status: pending
  - id: W8-B
    content: "Wave 8: Small pages — /privacy + /404"
    status: pending
  - id: W8-C
    content: "Wave 8: CI workflows + budgets + link check + 16-theme axe"
    status: pending
  - id: W8-D
    content: "Wave 8: Cloudflare Pages deploy + DNS + headers"
    status: pending
isProject: true
---

# minnow.sh — Website Build Plan

**Date:** 2026-09-12
**Goal:** Ship minnow.sh — a static Astro 5 + Tailwind v4 marketing + docs site that looks and behaves like the Minnow app — built from the design spec in `documentation/plans/Website Plan.md`.
**Granularity:** medium

## Context

Minnow (`HenriGrimm/Minnow`, v0.1.3, AGPL-3.0-or-later) has no website; its front door is a GitHub README. This plan builds the complete v1 site — Home, Download, Docs, Changelog (+ privacy, 404, feeds) — in **this workspace**, which will become the `HenriGrimm/minnow-web` repo.

Locked decisions (from the design doc, do not re-litigate):

| Decision | Choice |
|---|---|
| Domain | minnow.sh |
| Stack | Astro 5 + Tailwind v4 (static output), no UI framework — vanilla TS in `<script>` |
| Docs strategy | Build-time sync script pulls `documentation/` from the Minnow repo |
| Theme | `human-dark` default, light toggle, all 16 families live-switchable |
| Motion | Apple-style: motion reveals the product. No decorative motion. |

The full design spec — brand facts, voice rules, token values, component recipes, per-section copy, budgets — lives in `documentation/plans/Website Plan.md`. **Builders must read the relevant spec sections before starting their task.** Key binding constraints:

- **Token discipline:** no hex or `rgb()`/`hsl()` literal anywhere except `src/styles/vendor/tokens.css` (stylelint-enforced). Never write Tailwind `dark:` variants — theme blocks re-resolve via `data-theme`.
- **Voice:** plain, unhurried, no exclamation marks, no future-tense claims, single-player positioning.
- **Banned content:** no mention of Research, Experts, Benchmarking, Compare, Super Plan (release-gated), no Email/Studio apps, no agent-CLI providers. Only the seven sanctioned replacement rows.
- **Motion:** animate only `opacity`, `transform`, `color`, `background-color`, `border-color`, `box-shadow`, `filter`. Nothing loops. `prefers-reduced-motion` honoured at three levels.
- **Synced/generated files are never hand-edited:** `src/styles/vendor/tokens.css`, `src/content/docs/**`, `public/brand/**`, `src/assets/screenshots/**`, `src/data/releases.json`, `public/llms*.txt`.

## Architecture / Key Files

| File | Role | Action |
|------|------|--------|
| `package.json` | Deps + npm scripts (dev/build/preview/sync:minnow/fetch:releases/lint:css/check:*) | CREATE |
| `astro.config.mjs` | Astro 5 config: static output, `@tailwindcss/vite`, mdx, sitemap, pagefind, `site: https://minnow.sh` | CREATE |
| `.stylelintrc.json` | stylelint-config-standard + no-hex-outside-vendor guard | CREATE |
| `budgets.json` | Performance budgets (home HTML ≤22KB gz, CSS ≤45KB gz, home JS ≤25KB gz, LCP ≤180KB, Lighthouse ≥98/100/100/100) | CREATE |
| `CONTENT.md` | Voice rules copied from the spec §1.2 | CREATE |
| `scripts/sync-minnow.mjs` | Downloads Minnow tarball; vendors tokens (with the documented 4-token patch), docs, screenshots, brand; build-failing guards | CREATE |
| `scripts/fetch-releases.mjs` | GitHub Releases → `src/data/releases.json` | CREATE |
| `scripts/build-llms-txt.mjs` | Generates `public/llms.txt` + `public/llms-full.txt` | CREATE |
| `scripts/check-budgets.mjs` | Asserts `budgets.json` against `dist/` | CREATE |
| `scripts/check-a11y.mjs` | Playwright + axe, home page × 16 `data-theme` values | CREATE |
| `src/styles/vendor/tokens.css` | VERBATIM Minnow tokens (generated) | CREATE (generated) |
| `src/styles/tokens.site.css` | Site-only display/rhythm tokens (spec §3.5) | CREATE |
| `src/styles/theme.css` | Tailwind v4 `@theme inline` bridge (spec §3.8) | CREATE |
| `src/styles/base.css` | Reset + base (spec §3.7) + `[data-reveal]` rules | CREATE |
| `src/styles/theme-transitions.css` | 160ms theme transition + `.theme-no-transition` | CREATE |
| `src/styles/app-frame.css` | AppFrame replica styles, real app sizes | CREATE |
| `src/styles/prose.css` | Docs prose styles (spec §6.4) | CREATE |
| `src/scripts/theme.ts` | `THEME_FAMILIES`, `THEME_MODES`, `DEFAULT_THEME_ID`, `applyTheme`, `initTheme`; storage keys `minnow.theme*` | CREATE |
| `src/scripts/motion.ts` | `initReveal()`, `parkWhenHidden()` | CREATE |
| `src/scripts/hero.ts` | `initHeroSequence()` — the 2.4s load timeline | CREATE |
| `src/scripts/seams.ts` | `initSeams()` — scroll-scrubbed seam diagram | CREATE |
| `src/scripts/build-loop.ts` | `initBuildLoop()` — sticky pinned 5-step section | CREATE |
| `src/scripts/platform.ts` | `detectPlatform()` — userAgentData + fallback, Apple Silicon vs Intel | CREATE |
| `src/scripts/copy-button.ts` | `initCopyButtons()` for `[data-copy]` | CREATE |
| `src/scripts/nav.ts` | Sentinel IntersectionObserver → `.is-scrolled` nav border | CREATE |
| `src/scripts/search.ts` | `initSearch()` — Ctrl/Cmd+K Pagefind binding | CREATE |
| `src/layouts/Base.astro` | `<head>`, flash-guard IIFE, theme boot, Nav, Footer, OG meta | CREATE |
| `src/layouts/Docs.astro` | Three-pane docs layout | CREATE |
| `src/components/app/*.astro` | AppFrame + 7 subcomponents (live DOM replica of the Minnow shell) | CREATE |
| `src/components/icons/*.astro` | Inline SVG icon set + brand glyph | CREATE |
| `src/components/site/*.astro` | Nav, Footer, ThemeSwitcher, Button, Card, RowList, CodeBlock, Accordion, Eyebrow, Section, Reveal | CREATE |
| `src/components/home/*.astro` | One component per home section (§0–§15) | CREATE |
| `src/content/config.ts` + `src/content/docs-nav.ts` | Content collection + hand-maintained nav tree (validated at build) | CREATE |
| `src/data/*.ts` | site, providers, apps, replaces, themes, faq, releases (typed content constants) | CREATE |
| `src/pages/index.astro` | Home, 16 sections | CREATE |
| `src/pages/download.astro` | Download page | CREATE |
| `src/pages/changelog/index.astro` + `rss.xml.ts` | Changelog + RSS | CREATE |
| `src/pages/docs/[...slug].astro` | Docs routes | CREATE |
| `src/pages/privacy.astro`, `src/pages/404.astro` | Small pages | CREATE |
| `.github/workflows/ci.yml`, `sync-content.yml` | CI pipeline; daily content-sync PR | CREATE |

## Wave Breakdown

### Wave 1 — Scaffold

Greenfield workspace: this wave is a single scaffold task; every later task depends on it (directly or transitively).

#### Task W1-A: Repo scaffold — Astro 5 + Tailwind v4 + configs + placeholder page
- **Build:**
  - `package.json`: deps `astro ^5`, `@astrojs/mdx`, `@astrojs/sitemap`, `tailwindcss ^4`, `@tailwindcss/vite ^4`, `sharp`, `shiki`, `astro-pagefind`, `astro-og-canvas`; dev deps `stylelint`, `stylelint-config-standard`, `@lhci/cli`. Scripts: `dev`, `build`, `preview`. (Verified: Tailwind v4 in Astro uses the `@tailwindcss/vite` Vite plugin — the `@astrojs/tailwind` integration is deprecated.)
  - `astro.config.mjs`: `output: 'static'`, `site: 'https://minnow.sh'`, vite plugins `[@tailwindcss/vite()]`, integrations `[@astrojs/mdx()]`, markdown shiki config emitting CSS variables (mapped onto `--cm-*` tokens later).
  - `tsconfig.json` (extends `astro/tsconfigs/strict`), `.stylelintrc.json` (extends `stylelint-config-standard`; hex guard added in W2-A), `lighthouserc.json` (mobile preset, budgets from `budgets.json`), `budgets.json` (spec §7.8 table verbatim), `CONTENT.md` (voice rules from spec §1.2), `README.md` (repo purpose + dev commands), `.gitignore` (`node_modules`, `dist`, `.astro`, `src/data/releases.json`, `public/llms.txt`, `public/llms-full.txt`, `src/content/docs`, `src/styles/vendor/tokens.css`, `public/brand`, `src/assets/screenshots`).
  - `src/styles/theme.css`: the full `@theme inline` bridge from spec §3.8 (`@import "tailwindcss";` first).
  - `src/layouts/Base.astro`: minimal `<html data-theme="human-dark">`, `<head>` with `theme.css` import, `<body>` slot.
  - `src/pages/index.astro`: placeholder page using Base with an `h1` "minnow.sh".
  - `npm install` must succeed.
- **Test:** `npm run build` exits 0 and emits `dist/index.html`; `npm run dev` serves the placeholder at :4321; `npx astro check` passes.
- **Accept:** `npm run build` produces a working `dist/` and the dev server renders the placeholder page.
- **Touches:** `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `.stylelintrc.json`, `lighthouserc.json`, `budgets.json`, `README.md`, `CONTENT.md`, `.gitignore`, `src/styles/theme.css`, `src/layouts/Base.astro`, `src/pages/index.astro`

### Wave 2 — Design system & site chrome

#### Task W2-A: Design tokens — vendor/tokens.css, tokens.site.css, base.css, stylelint hex guard, sync-minnow.mjs
- **Build:**
  - `scripts/sync-minnow.mjs` (`node scripts/sync-minnow.mjs --repo HenriGrimm/Minnow --ref main`): download repo tarball (no submodule); extract `src/styles/tokens.css` → `src/styles/vendor/tokens.css` with a "generated, do not edit" banner and the one documented patch — append the four `--mn-syntax-*` lines to the `human-dark` and `mint-dark` blocks (spec §3.1); `documentation/images/*.png` → `src/assets/screenshots/` (skip `app-research.png`); `public/logos/**` → `public/brand/`. Guard: fail loudly if the vendored file does not contain all 16 `[data-theme=...]` blocks. (Docs transforms + nav validation are added in W7-A.)
  - `src/styles/tokens.site.css`: the full `:root` block from spec §3.5 (display scale, tracking, section rhythm, containers, radii, easings).
  - `src/styles/base.css`: spec §3.7 — `box-sizing` reset, antialiased, `:focus-visible` ring, scrollbar block, `::selection`, `prefers-reduced-motion` kill block; web changes (no `overflow:hidden`/flex on body, `body { font-size: var(--fs-body); line-height: var(--lh-body) }`, guarded `scroll-behavior: smooth`).
  - `src/styles/theme-transitions.css`: ported from the app — 160ms `background-color`/`border-color`/`fill`/`stroke` transition, `.theme-no-transition` opt-out, input/textarea/select caret-lag fix.
  - `.stylelintrc.json`: add `color-no-hex: true` (disabled for `src/styles/vendor/**`) + `declaration-property-value-disallowed-list` for `rgb(`/`rgba(`/`hsl(` outside the vendor file.
  - `package.json`: add `sync:minnow` script. `src/layouts/Base.astro`: import `vendor/tokens.css`, `tokens.site.css`, `base.css`, `theme-transitions.css`, `theme.css` in that order.
- **Test:** `npm run sync:minnow` runs and `grep -c 'data-theme=' src/styles/vendor/tokens.css` = 16; plant a hex literal in `src/styles/base.css` → `npx stylelint "src/styles/**/*.css"` fails; remove it → passes.
- **Accept:** stylelint fails on a planted hex outside `vendor/tokens.css` and passes once removed, with all 16 theme blocks present in the vendored file.
- **Touches:** `scripts/sync-minnow.mjs`, `src/styles/vendor/tokens.css`, `src/styles/tokens.site.css`, `src/styles/base.css`, `src/styles/theme-transitions.css`, `.stylelintrc.json`, `package.json`, `src/layouts/Base.astro`
- **Depends on:** W1-A

#### Task W2-B: Theme runtime — theme.ts, flash guard IIFE, theme-transitions wiring
- **Build:**
  - `src/scripts/theme.ts`: `export const THEME_FAMILIES = ['swamp','desert','ocean','coral','mono','matrix','human','mint'] as const; export const THEME_MODES = ['dark','light'] as const; export const DEFAULT_THEME_ID = 'human-dark';` plus `applyTheme(id: string)` and `initTheme()`. Storage keys identical to the app: `minnow.theme`, `minnow.theme.followSystem`, `minnow.theme.family`. `followSystem` via `matchMedia('(prefers-color-scheme: light)')`, opt-in only.
  - `src/layouts/Base.astro`: inline render-blocking IIFE in `<head>` (spec §7.4) carrying the `THEME_BG` map for all 16 ids; apply order: add `.theme-no-transition` → set `data-theme` + `colorScheme` → two `requestAnimationFrame`s → remove `.theme-no-transition`, add `.theme-ready`; sync `<meta name="theme-color">` to computed `--mn-bg`. Wire `initTheme()` as a module script.
- **Test:** `npm run build`; in preview: `document.documentElement.dataset.theme` is `'human-dark'` on first visit; setting it to `'matrix-light'` yields `getComputedStyle(document.body).backgroundColor` of `rgb(238, 242, 238)`; all three `minnow.theme*` keys land in `localStorage`.
- **Accept:** first paint is `human-dark` with no flash, and any of the 16 theme ids recolors the page to its `--mn-bg`.
- **Touches:** `src/scripts/theme.ts`, `src/layouts/Base.astro`
- **Depends on:** W2-A

#### Task W2-C: Site chrome + shared components — Nav, Footer, ThemeSwitcher, Button, Card, RowList, CodeBlock, Accordion, Eyebrow, Section, Reveal
- **Build:**
  - `src/components/site/Nav.astro`: sticky 64px, `--mn-bg`, no border until scrolled (1px `--mn-border` fades in over 150ms via `src/scripts/nav.ts` — single IntersectionObserver on a sentinel div, no scroll listener); left glyph (28px, `--mn-accent` fill) + "Minnow" 15px/600/-0.02em; links Docs · Changelog · Themes; right: GitHub star chip (build-time fetch, mono tabular-nums), ThemeSwitcher, Discord icon, Download primary button. Mobile <768px: hamburger → full-screen sheet, `translateX(100%) → 0` over `--duration-normal` `--ease-out`, scrim `--mn-overlay`.
  - `src/components/site/ThemeSwitcher.astro`: three-state segmented control (Dark · Light · Auto) matching the app's `.settings-segments`; caret/hold opens the 8-family picker; calls `applyTheme`.
  - `src/components/site/Footer.astro`: four-column shell (final link set filled in W4-F).
  - Shared components per spec §3.9 recipes: `Button.astro` (primary with the fine-pointer inversion hover + `:active scale(0.97)`; ghost variant), `Card.astro`, `RowList.astro` (hover veil), `CodeBlock.astro` (Shiki css-variables mapped onto `--cm-*`/`--mn-syntax-*`), `Accordion.astro` (native `<details>`/`<summary>` on hairline rows), `Eyebrow.astro`, `Section.astro`, `Reveal.astro` (wrapper adding `data-reveal` + `--reveal-delay` prop).
  - `src/layouts/Base.astro`: mount Nav + Footer.
- **Test:** `npm run build` passes; preview: nav renders on home; ThemeSwitcher Dark/Light/Auto + family picker switch `data-theme` across all 16 without rebuild; at 375px the hamburger opens the sheet and the scrim covers the page.
- **Accept:** Nav + Footer render on every page and the segmented theme control switches all 16 themes live.
- **Touches:** `src/components/site/**`, `src/scripts/nav.ts`, `src/layouts/Base.astro`
- **Depends on:** W2-A, W2-B

#### Task W2-D: Content data files — site, providers, apps, replaces, themes, faq
- **Build:**
  - `src/data/site.ts`: `export const SITE = { url, repo: 'HenriGrimm/Minnow', repoUrl, discord, sponsor, author, version: '0.1.3' }` (values from spec §1.1).
  - `src/data/providers.ts`: the 9 cloud providers in registry order (OpenRouter, OpenAI, Groq, Mistral, OpenCode Zen, OpenCode Go, Anthropic, DeepSeek, GitHub Copilot), 2 local (LM Studio, Ollama), runtimes (llama.cpp, MLX) — spec §1.5.
  - `src/data/apps.ts`: the six rail apps + Orchestrator boards with names/blurbs from spec §1.3–§1.4.
  - `src/data/replaces.ts`: exactly the seven sanctioned rows from spec §1.4 (`insteadOf`, `youGet`, `honestBecause`).
  - `src/data/themes.ts`: 8 families × `{ id, name, blurb, dark, light }` from spec §3.3.
  - `src/data/faq.ts`: the ten FAQ items from spec §6.2 §13 with answers written in voice (no exclamation marks).
  - All typed, no `any`.
- **Test:** `npx astro check` passes; `node -e` assertion (or a quick script) imports each module and checks counts: providers 9+2+2, replaces rows = 7, themes = 8, faq = 10.
- **Accept:** all six data modules export typed constants with the exact counts above and type-check cleanly.
- **Touches:** `src/data/**`
- **Depends on:** W1-A

### Wave 3 — App frame replica

#### Task W3-A: Icon set + brand marks — inline SVGs, glyph, favicon set
- **Build:**
  - `src/components/icons/*.astro`: inline SVGs, 24×24, `stroke="currentColor"`, `stroke-width="1.5"`, rounded caps/joins (do NOT pull the Flaticon Uicons font). Set: rail icons (Code, Source Control, Models, Brain, Issues, Scheduler, Settings), chrome icons (new-chat, attach, mic, sparkle, send-fish, github, discord, copy, caret, hamburger, close, search, sun, moon, auto).
  - `src/components/icons/Glyph.astro`: the canonical fish mark from spec §5.3 (body/tail paths + eye circle, `viewBox="0 0 100 100"`), `fill: currentColor`, eye dot `--mn-bg`; plus the horizontal lockup with "Tiny by design."
  - `public/brand/`: `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.svg` with `prefers-color-scheme` swap. Brand black `#0f0f10` and lockup grey `#6b6b70` appear **only** here (theme-independent assets — the one sanctioned exception to the no-hex rule, outside `src/styles`).
- **Test:** `npm run build` passes; preview: icons render as inline SVG and `getComputedStyle(svg).stroke` follows the theme fg colour after switching `data-theme`; `dist/brand/` contains all five favicon files.
- **Accept:** every icon renders as inline SVG inheriting the theme colour, and the full favicon set is emitted to `dist/brand/`.
- **Touches:** `src/components/icons/**`, `public/brand/**`
- **Depends on:** W1-A

#### Task W3-B: AppFrame replica — 7 subcomponents + app-frame.css
- **Build:**
  - `src/styles/app-frame.css`: `.app-frame` shell — `--radius-lg`, 1px `--mn-border`, `--shadow-lift`, `overflow: hidden`; the app's **real** sizes inside (14px body, 13px mono, 11px labels, 52px topbar, 48px rail, 300px sidebar); a CSS `zoom`/`scale` wrapper for small viewports (scale as a whole, never reflow); send-button fish glyph `transform: rotate(180deg)`.
  - `src/components/app/AppFrame.astro` (outer window), `WindowChrome.astro` (traffic lights, workspace name, "Code" breadcrumb, Ready dot, model chip), `AppRail.astro` (48px rail, 7 icons, active pill `--mn-accent-soft` on Code), `ChatList.astro` (300px; "+ New chat" outlined; rows with PLA/BUI/GEN mode badges; mono model id at `--mn-fg-subtle`; "8 files +73 −79" stat line), `Transcript.astro` (assistant markdown 14px/1.65, one tool-call row, file-changes summary card with Commit / Create PR / Review buttons), `Composer.astro` (mode select, model chip, attach/mic/sparkle inset buttons, 44px send), `StatusBar.astro` ("Terminal" left, "58.5 t/s" right, mono tabular-nums).
  - Use icons from W3-A. Content is representative real data, not lorem.
- **Test:** `npm run build` passes; preview: AppFrame renders; set `data-theme` to `human-dark`, `matrix-light`, `mint-dark` and read back computed `background-color`/`color` of rail + chrome (all differ and match the theme's tokens); at 375px viewport the frame scales without reflow (rail stays 48px-equivalent).
- **Accept:** the replica reads as a screenshot of the app and recolors correctly under every theme.
- **Touches:** `src/components/app/**`, `src/styles/app-frame.css`
- **Depends on:** W2-A, W3-A

### Wave 4 — Home page (static, zero motion)

Home sections are assembled sequentially into `src/pages/index.astro` (each task appends its sections and verifies in the browser). Copy comes from spec §6.2 — final copy, not placeholders.

#### Task W4-A: Home §0 Hero + platform detection + copy button
- **Build:**
  - `src/scripts/platform.ts`: `export type Platform = 'windows' | 'macos-arm' | 'macos-intel' | 'linux' | 'unknown'; export function detectPlatform(): Platform` — `navigator.userAgentData` with UA-string fallback, Apple Silicon vs Intel.
  - `src/scripts/copy-button.ts`: `export function initCopyButtons()` — wires `[data-copy]` elements to `navigator.clipboard.writeText`, shows a transient "copied" state.
  - `src/components/home/Hero.astro` (spec §6.2 §0): eyebrow `AGPL-3.0-OR-LATER · v0.1.3 · WINDOWS · MACOS · LINUX`; H1 `--fs-display` "A full agentic development workspace."; lead at `--fs-lead`/`--mn-fg-muted`/`--container-narrow`; CTAs — primary "Download for macOS" (label swaps via `detectPlatform`) + ghost "Read the docs →"; small mono platform links + `git clone https://github.com/HenriGrimm/Minnow.git` with copy button; `AppFrame` full-bleed to `--container-wide`, bleeding slightly off the bottom of the fold. **Static** — no animation yet (W5-B adds the sequence).
  - `src/pages/index.astro`: Base layout + Hero.
- **Test:** `npm run build` passes; preview: with a macOS UA the primary CTA reads "Download for macOS"; clicking the copy button puts the clone URL on the clipboard (verify via `navigator.clipboard.readText()` in the console or manual paste).
- **Accept:** home renders the hero with the app frame, a platform-correct download label, and a working copy button.
- **Touches:** `src/components/home/Hero.astro`, `src/scripts/platform.ts`, `src/scripts/copy-button.ts`, `src/pages/index.astro`
- **Depends on:** W2-C, W2-D, W3-B

#### Task W4-B: Home §1 Runs-on + §2 Seams (static)
- **Build:**
  - `src/components/home/RunsOn.astro` (§1): quiet strip, hairline top border, small heading "It runs on whatever you point it at.", 4×3 grid of mono wordmarks at `--mn-fg-muted` (hover `--mn-fg`) from `data/providers.ts` (13 entries), footnote "No accounts, no subscriptions, no usage limits, no telemetry."
  - `src/components/home/Seams.astro` (§2): centred, `--section-y-lg`, `--container-narrow`; H2 `--fs-h1` "Minnow exists because the tools are good but the seams between them were not."; three-sentence body; the seam diagram in its **static** state — five labelled tiles (Editor · Tracker · Git · Models · Notes) apart with `--mn-danger-soft` gap fills (scroll scrub arrives in W5-C).
  - `src/pages/index.astro`: append both sections.
- **Test:** `npm run build` passes; preview: both sections render in order after the hero; wordmark count in DOM = 13; `npx stylelint "src/components/**/*.astro"` clean.
- **Accept:** §1 and §2 render with final copy and the static five-tile seam diagram.
- **Touches:** `src/components/home/RunsOn.astro`, `src/components/home/Seams.astro`, `src/pages/index.astro`
- **Depends on:** W4-A

#### Task W4-C: Home §3 Build loop (static) + §4 What it replaces
- **Build:**
  - `src/components/home/BuildLoop.astro` (§3): the five steps (idea → Plan mode; Orchestrator board → `app-orchestrator.png`; Source Control → `app-source-control.png`; Issues → `app-issues.png`; Brain → `app-brain.png`) as a left list + right screenshot, **static stacked layout** (pin arrives in W5-D); step markers are filled dots, not border-left stripes; closing line "You can also just open a repo and start typing."
  - `src/components/home/Replaces.astro` (§4): the seven rows from `data/replaces.ts` as a stack on hairline dividers — left `insteadOf` in mono `--mn-fg-muted`, right surface name at `--fs-h3`/600 + one line; hover veil only; closing line "They share one chat engine, one tool set, one session store, and one workspace root. What the agent learns in one is available in all of them."
  - `src/pages/index.astro`: append both.
- **Test:** `npm run build` passes; preview: DOM contains exactly 7 replace rows and 5 build-loop steps; all four screenshots load via `astro:assets` (no 404s in network log).
- **Accept:** §3 and §4 render with all five build-loop steps and all seven sanctioned rows.
- **Touches:** `src/components/home/BuildLoop.astro`, `src/components/home/Replaces.astro`, `src/pages/index.astro`
- **Depends on:** W4-B

#### Task W4-D: Home §5 App deep-dives + §6 Models + §7 Agents & tools bento
- **Build:**
  - `src/components/home/DeepDives.astro` (§5): seven alternating one-viewport sections in order Code → Source Control → Orchestrator → Models → Brain → Issues → Scheduler; each with mono eyebrow, declarative H2, 2–3 sentences, 3–4 mono chips, screenshot in an AppFrame-style border; the Code section reserves a mount slot for the Quick Edit demo (W5-E).
  - `src/components/home/Models.astro` (§6): H2 "It runs on whatever you point it at."; three columns Local / Cloud / Both (content per spec); the hardware-fit card — model name, size, quant, fit bar using `--mn-success`/`--mn-warning`/`--mn-danger`, estimated t/s in mono; pull quote "the alternative is downloading 40 GB to discover it swaps."
  - `src/components/home/Tools.astro` (§7): flat bordered bento grid — wide permission card (105 mono tiles, static; caption per spec), Sub-agents (8, with the no-nested-spawn constraint), Modes (4, with the Plan-mode payload line), Skills (19), MCP (`mcp__<server>__<tool>`, Context7 default), Worktrees.
  - `src/pages/index.astro`: append all three.
- **Test:** `npm run build` passes; preview: 7 deep-dive sections in the spec order; bento has exactly 6 cards; numbers in DOM match spec §1.5 (105 tiles, 8, 4, 19).
- **Accept:** §5–§7 render with all seven deep-dives and the six-card bento at the correct numbers.
- **Touches:** `src/components/home/DeepDives.astro`, `src/components/home/Models.astro`, `src/components/home/Tools.astro`, `src/pages/index.astro`
- **Depends on:** W4-C

#### Task W4-E: Home §8 Open at the seams + §9 Themes switcher + §10–§12
- **Build:**
  - `src/components/home/OpenSeams.astro` (§8): H2 = the README open-source line; five cards (Skills, Tools, Agents, Prompts, Themes) each with a **real** code snippet rendered by `CodeBlock` (app syntax colours) and a link to the relevant doc.
  - `src/components/home/Themes.astro` (§9): H2 "Sixteen built in, which is fifteen more than strictly necessary."; eight family cards from `data/themes.ts`, each with light/dark toggle + 4-swatch mini-preview (bg / surface-2 / accent / fg); selecting one calls `applyTheme` so the **entire page** recolours via the 160ms transition; an `AppFrame` sits beside the picker; choice persists via `theme.ts` storage keys; footnote linking `src/styles/tokens.css` on GitHub.
  - `src/components/home/Yours.astro` (§10): the five README bullets in substance; `~/.minnow` tree in mono (`chats/ config/ brain/ models/ secrets/ skills/ tools/`); both pull quotes. No padlocks/shields/red.
  - `src/components/home/FreeForever.astro` (§11): "No feature is ever withheld to make a paid tier." + the Blender paragraph in full + Sponsor/Discord/GitHub links. **No pricing table.**
  - `src/components/home/Status.astro` (§12): the honest one-maintainer paragraph + Discord/Issues/Sponsor links.
  - `src/pages/index.astro`: append all five.
- **Test:** `npm run build` passes; preview: clicking the mint family card sets `data-theme="mint-dark"` and `getComputedStyle(document.body).backgroundColor` = `rgb(20, 22, 21)`; `localStorage['minnow.theme']` updates; all five §8 snippets render with syntax colours.
- **Accept:** the themes section live-switches all 16 themes page-wide (including the AppFrame) and §8–§12 render with final copy.
- **Touches:** `src/components/home/OpenSeams.astro`, `src/components/home/Themes.astro`, `src/components/home/Yours.astro`, `src/components/home/FreeForever.astro`, `src/components/home/Status.astro`, `src/pages/index.astro`
- **Depends on:** W4-D

#### Task W4-F: Home §13 FAQ + §14 Final CTA + index assembly + footer columns + content audit
- **Build:**
  - `src/components/home/Faq.astro` (§13): `Accordion` over the ten items from `data/faq.ts`, `--container-narrow`.
  - `src/components/home/FinalCta.astro` (§14): centred, `--section-y-lg`; H2 `--fs-h1` "Open a repo and start typing."; download button + `git clone` block with copy.
  - `src/components/site/Footer.astro`: final four columns — Product (Download, Changelog, Themes, Roadmap) · Documentation (Install, Connect a model, Apps, Architecture, Troubleshooting) · Community (GitHub, Discord, Issues, Sponsor) · Legal (AGPL-3.0-or-later, Third-party notices, Privacy); bottom row lockup + "Tiny by design." + "© 2026 Henri Grimm · AGPL-3.0-or-later".
  - `src/pages/index.astro`: full §0–§15 assembly in order.
  - Content audit pass over the whole page (spec §9): no mention of Email, Studio, agent-CLI providers, Research, Experts, Benchmarking, Compare, or Super Plan; only the seven sanctioned rows; **no exclamation marks** in body copy; every number matches spec §1.5; README typos ("intergrated", "availible", "combinded") not reproduced.
- **Test:** `npm run build` passes; preview with JS disabled (or `astro build` output opened directly): all 16 sections present in order; `grep -c '!'` over the extracted body copy strings returns 0; `grep -riE 'super plan|benchmarking|experts' dist/index.html` returns nothing.
- **Accept:** the home page is complete and correct with JS disabled — all 16 sections, final copy, zero banned claims.
- **Touches:** `src/components/home/Faq.astro`, `src/components/home/FinalCta.astro`, `src/components/site/Footer.astro`, `src/pages/index.astro`
- **Depends on:** W4-E

### Wave 5 — Motion

`W5-B`…`W5-E` touch disjoint files and may run concurrently once W5-A lands.

#### Task W5-A: motion.ts reveal primitive + reduced-motion + visibility park
- **Build:**
  - `src/scripts/motion.ts`: `export function initReveal()` — one IntersectionObserver, `rootMargin: "0px 0px -12% 0px"`, `threshold: 0.01`; adds `.is-in` to `[data-reveal]` and **unobserves immediately** (no re-animation on scroll-up); early-returns when `matchMedia('(prefers-reduced-motion: reduce)').matches`. `export function parkWhenHidden()` — `document.visibilitychange` → sets `:root[data-mn-render='idle']` when hidden (port of the app's hidden-window park).
  - `src/styles/base.css`: the `[data-reveal]` transition rules from spec §4.2 (stagger via inline `--reveal-delay`, cap 400ms) + the reduced-motion override `[data-reveal] { opacity: 1; transform: none; }`.
  - `src/layouts/Base.astro`: import `motion.ts`, call both inits.
- **Test:** `npm run build` passes; preview: a `[data-reveal]` element starts at `opacity: 0` and gains `.is-in` (opacity 1) when scrolled into view, exactly once; with reduced motion forced (Playwright `reducedMotion: 'reduce'` or a temporary flag) content is visible at load with no transition; backgrounding the tab sets `data-mn-render="idle"` on `:root`.
- **Accept:** `[data-reveal]` elements animate in once on scroll and are fully visible with zero animation under `prefers-reduced-motion`.
- **Touches:** `src/scripts/motion.ts`, `src/styles/base.css`, `src/layouts/Base.astro`
- **Depends on:** W2-A

#### Task W5-B: Hero load sequence (hero.ts)
- **Build:**
  - `src/scripts/hero.ts`: `export function initHeroSequence()` — the §0 timeline: 0ms frame draw (`opacity 0→1`, `scale 0.98→1`, `translateY(16px)→0`, 600ms `--ease-settle`); 180ms chrome + traffic lights; 260ms rail icons stagger 40ms `translateX(-8px)→0`; 420ms chat rows fade-up 30ms apart (cap 8); 620ms transcript; 900ms composer slides up 12px; 1150ms caret blinks then types "Add a dark mode toggle to settings" at ~28ms/char; 2000ms tool-call row streams in with the app's `tool-call-spin` spinner, resolves to a check; 2350ms summary card slides up 10px. **Total ≈2.4s, then it stops — no loop.** Reduced motion → final state, zero animation. On scroll: one Apple settle — `scale(1.04)→1` + `--radius-2xl → --radius-lg` over the first 480px via `@supports (animation-timeline: view())` with a single rAF-throttled `--p` fallback.
  - `src/components/home/Hero.astro`: add the stage classes/data attributes the sequence drives.
- **Test:** `npm run build` passes; preview: the hero assembles on load and is at rest by ~2.6s (no further animation frames — verify via a `getAnimations()` count or a 3s wait + screenshot diff); reduced motion → final state on first paint.
- **Accept:** the hero assembles pane-by-pane on load, types the prompt, resolves the tool call, and stops at the final state.
- **Touches:** `src/scripts/hero.ts`, `src/components/home/Hero.astro`
- **Depends on:** W4-A, W5-A

#### Task W5-C: Seam diagram scroll scrub (seams.ts)
- **Build:**
  - `src/scripts/seams.ts`: `export function initSeams()` — scrubs the §2 diagram with `--p` (0→1) over the section: five tiles slide together, gaps close to zero, the five 1px borders resolve into one continuous hairline rectangle, label swaps to "one workspace, one tool set". `transform` only, reversible. Native `animation-timeline: view()` where available; JS fallback is one rAF-throttled scroll listener writing `--p` on the pinned section only. Reduced motion → final state.
  - `src/components/home/Seams.astro`: data attributes for the scrub.
- **Test:** `npm run build` passes; preview: scrolling through the section changes the tiles' computed `transform` from apart to together; scrolling back reverses it; reduced motion → static final state.
- **Accept:** the seam diagram scrubs with scroll, is fully reversible, and animates transform only.
- **Touches:** `src/scripts/seams.ts`, `src/components/home/Seams.astro`
- **Depends on:** W4-B, W5-A

#### Task W5-D: Pinned build-loop section (build-loop.ts)
- **Build:**
  - `src/scripts/build-loop.ts`: `export function initBuildLoop()` — `position: sticky` viewport with a `500vh` spacer (never intercept the wheel); left column tracks the active step (filled `--mn-accent` dot + `--mn-fg` text; inactive `--mn-fg-subtle`); right column screenshot cross-fades with 12px y-offset over 300ms. Reduced motion → pin removed, spacer removed, the five steps render as five ordinary stacked sections.
  - `src/components/home/BuildLoop.astro`: pin structure + data attributes.
- **Test:** `npm run build` passes; preview: scrolling through the 500vh range advances the active step 1→5 in order and cross-fades the four screenshots; reduced motion → five ordinary sections, no sticky.
- **Accept:** the pinned build loop walks all five steps as the user scrolls and collapses to a stacked list under reduced motion.
- **Touches:** `src/scripts/build-loop.ts`, `src/components/home/BuildLoop.astro`
- **Depends on:** W4-C, W5-A

#### Task W5-E: Quick Edit demo + tools-permission demo
- **Build:**
  - `src/components/home/QuickEdit.astro`: a small code block where a plain-English comment is typed, then replaced by real code, with a `Tab ⇥` chip; plays **once** on first view (IntersectionObserver, unobserve after), then rests. Reduced motion → final state.
  - `src/components/home/DeepDives.astro`: mount `QuickEdit` in the Code deep-dive slot.
  - `src/components/home/Tools.astro`: permission demo — the 105 tiles stagger in, then a handful visibly toggle Full → Ask → Off; plays once on first view.
- **Test:** `npm run build` passes; preview: both demos play on first view and do **not** replay when scrolling away and back; reduced motion → static final state.
- **Accept:** the Quick Edit and permission demos each play once on first view and rest.
- **Touches:** `src/components/home/QuickEdit.astro`, `src/components/home/DeepDives.astro`, `src/components/home/Tools.astro`
- **Depends on:** W4-D, W5-A

### Wave 6 — Download & changelog

#### Task W6-A: fetch-releases.mjs + releases data layer
- **Build:**
  - `scripts/fetch-releases.mjs`: fetch `https://api.github.com/repos/HenriGrimm/Minnow/releases/latest` and `/releases` (paginated) → `src/data/releases.json`: per release `{ version, name, publishedAt, prerelease, body, assets: [{ name, platform, url, size, digest }] }`; normalize asset names to platforms (`win-x64` NSIS, `darwin-arm64` dmg, `darwin-x64`, `linux` AppImage). Unauthenticated; on rate-limit or network failure, exit non-zero with a clear message (CI re-runs).
  - `src/data/releases.ts`: `export function getLatestRelease(): Release; export function getReleases(): Release[]; export function findLatestForPlatform(p: Platform): Release | null` (most recent release that has an asset for `p`).
  - `package.json`: add `fetch:releases` script; add `src/data/releases.json` to `.gitignore`.
- **Test:** `npm run fetch:releases` writes `src/data/releases.json` with ≥1 release; `node -e` assertion: `getLatestRelease().version` matches the live GitHub latest; `findLatestForPlatform('macos-arm')` returns `null` or an older release (v0.1.3 shipped Windows + Linux only — the missing-asset case must resolve, not throw).
- **Accept:** `releases.json` is generated and the data layer resolves the correct asset per platform, including the missing-asset case.
- **Touches:** `scripts/fetch-releases.mjs`, `src/data/releases.json`, `src/data/releases.ts`, `package.json`
- **Depends on:** W1-A

#### Task W6-B: /download page — platform detect, missing-asset fallback, per-platform notes
- **Build:**
  - `src/pages/download.astro` (spec §6.3): lead with the asset for `detectPlatform()` (Apple Silicon vs Intel); every other platform listed below, never hidden; version, publish date, file name, size, digest where available; **missing-asset case** — say so plainly and offer the most recent release that has it; per-platform notes (Windows SmartScreen "More info → Run anyway", macOS dmg vs zip, Linux `chmod +x`); beta channel note (electron-updater against GitHub Releases, channels Stable and Beta); build-from-source block (`git clone` / `cd Minnow` / `npm install && npm start`); checksums section when digests exist.
- **Test:** `npm run build` passes; preview with a darwin-arm UA: the macOS section leads and shows the missing-asset message with the fallback release; with a win UA: the NSIS asset leads with size and digest.
- **Accept:** `/download` renders the current release correctly, including the case where the visitor's platform has no asset.
- **Touches:** `src/pages/download.astro`
- **Depends on:** W6-A, W2-C

#### Task W6-C: /changelog + RSS
- **Build:**
  - `src/pages/changelog/index.astro` (spec §6.5): left rail with version + date sticky per entry, right column with release notes rendered as markdown, latest first; version chips in mono; pre-releases marked `BETA` with a `--mn-warning`-bordered chip.
  - `src/pages/changelog/rss.xml.ts`: RSS endpoint generated from `releases.json`.
- **Test:** `npm run build` passes; preview: `/changelog` lists releases latest-first with notes; `curl -s localhost:4321/changelog/rss.xml | xmllint --noout -` (or a node XML parse) exits 0; a prerelease entry shows the BETA chip.
- **Accept:** `/changelog` renders all releases with notes and `/changelog/rss.xml` is valid RSS.
- **Touches:** `src/pages/changelog/**`
- **Depends on:** W6-A, W2-C

### Wave 7 — Docs

#### Task W7-A: Docs sync transforms + content collections + docs-nav validation
- **Build:**
  - `scripts/sync-minnow.mjs` (extend): `documentation/manual/**/*.md` → `src/content/docs/manual/**` with injected frontmatter (title from H1, description from first paragraph), relative links rewritten to `/docs/...`, image paths rewritten; `documentation/contributor/**` and `documentation/plugins/**` the same; `documentation/ROADMAP.md` → `src/content/docs/roadmap.md`.
  - Guards (each fails the build loudly): a `docs-nav.ts` entry with no matching synced file, or a synced file absent from the nav; a doc or site string mentioning a release-gated surface (Research, Experts, Benchmarking, Compare, Super Plan) outside an explicit allowlist; any internal link 404ing.
  - `src/content/config.ts`: Astro Content Collection `docs` (glob loader over `src/content/docs/**/*.md`).
  - `src/content/docs-nav.ts`: hand-maintained nav tree (order + labels) covering manual/contributor/plugins/roadmap.
- **Test:** `npm run sync:minnow` populates `src/content/docs/**` with frontmatter on every file; plant a `docs-nav.ts` entry with no matching file → `npm run build` fails with the nav error; plant a "Super Plan" mention in a scratch doc → build fails; remove both → build passes.
- **Accept:** every doc in `documentation/manual/` syncs with frontmatter and working links, and a broken nav entry fails the build.
- **Touches:** `scripts/sync-minnow.mjs`, `src/content/config.ts`, `src/content/docs-nav.ts`, `src/content/docs/**`
- **Depends on:** W2-A

#### Task W7-B: Docs layout — 3-pane Docs.astro + prose.css + [...slug].astro
- **Build:**
  - `src/layouts/Docs.astro` (spec §6.4): left nav tree from `docs-nav.ts` with active state; content column capped at `--prose` (72ch); right-hand TOC generated from `h2`/`h3`.
  - `src/styles/prose.css`: `p` margin `0.65em 0`; headings `1em 0 0.5em` weight 600 line-height 1.25; inline code on `--mn-surface-2`; fenced code per §3.9; tables with `--mn-border` cells + `--mn-surface-1` headers; blockquote as a left `--mn-border-strong` rule (the one legitimate left border).
  - `src/pages/docs/[...slug].astro`: render the entry; "Edit this page" link to the file in `HenriGrimm/Minnow`; "Last synced" line.
- **Test:** `npm run build` passes; route count in `dist/docs/` equals the synced doc count; preview a doc: TOC lists its h2/h3; the edit link points at `github.com/HenriGrimm/Minnow/blob/main/documentation/...`; computed `p` margin matches `0.65em`.
- **Accept:** every synced doc page renders in the three-pane layout with working links, images, and TOC.
- **Touches:** `src/layouts/Docs.astro`, `src/styles/prose.css`, `src/pages/docs/**`
- **Depends on:** W7-A, W2-C

#### Task W7-C: Pagefind search + Ctrl/Cmd+K
- **Build:**
  - `astro.config.mjs`: add the `astro-pagefind` integration.
  - `src/scripts/search.ts`: `export function initSearch()` — bind `Ctrl/Cmd+K` to open the Pagefind search UI (custom overlay `src/components/site/SearchPalette.astro` if the default UI doesn't fit the token system — style it with `--mn-*` tokens, no new colours).
  - `src/layouts/Base.astro`: import `search.ts`.
- **Test:** `npm run build` emits `dist/pagefind/` with a non-empty index; preview: pressing `Ctrl+K` opens the search; typing "theme" returns docs results; Esc closes.
- **Accept:** `Ctrl/Cmd+K` opens a working docs search backed by the Pagefind index.
- **Touches:** `astro.config.mjs`, `src/scripts/search.ts`, `src/components/site/SearchPalette.astro`, `src/layouts/Base.astro`
- **Depends on:** W7-B

### Wave 8 — Polish & ship

`W8-A`, `W8-B`, `W8-C` touch disjoint files and may run concurrently.

#### Task W8-A: OG images, llms.txt, robots/sitemap/feed
- **Build:**
  - `astro-og-canvas`: per-page OG images in `human-dark` colours (glyph + title in the site's own type) — `src/pages/og.astro` or per-page component; wire OG meta tags + canonical `https://minnow.sh` into `src/layouts/Base.astro`.
  - `scripts/build-llms-txt.mjs`: generate `public/llms.txt` (plain-text product summary) and `public/llms-full.txt` (concatenated docs dump); add `build:llms` script.
  - `public/robots.txt`; `@astrojs/sitemap` configured in `astro.config.mjs` (emits `sitemap-index.xml`); `feed.xml` (RSS of changelog entries, reusing `releases.json`).
  - JSON-LD `SoftwareApplication` in Base head: `applicationCategory: DeveloperApplication`, `operatingSystem: "Windows, macOS, Linux"`, `offers: { price: "0", priceCurrency: "USD" }`, `license: https://www.gnu.org/licenses/agpl-3.0.html`.
- **Test:** `npm run build` passes; `dist/` contains OG image(s), `llms.txt`, `llms-full.txt` (containing doc titles), `robots.txt`, `sitemap-index.xml`, `feed.xml`; Base head contains the JSON-LD block.
- **Accept:** all meta/asset endpoints (OG, llms.txt, robots, sitemap, feed) are emitted in the build.
- **Touches:** `scripts/build-llms-txt.mjs`, `public/**`, `astro.config.mjs`, `src/layouts/Base.astro`, `src/pages/og.astro`
- **Depends on:** W4-F, W6-C, W7-B

#### Task W8-B: Small pages — /privacy + /404
- **Build:**
  - `src/pages/privacy.astro` (spec §6.6): "This site sets no cookies and runs no analytics." plus what the app does and does not send. Short and true.
  - `src/pages/404.astro`: the fish glyph, "This page swam off.", links home and to docs. One joke is allowed.
- **Test:** `npm run build` passes; preview: `/privacy` renders with the no-cookies sentence; navigating to `/nonexistent` serves the 404 page with the fish glyph; no exclamation marks in either.
- **Accept:** `/privacy` and `/404` render with final copy.
- **Touches:** `src/pages/privacy.astro`, `src/pages/404.astro`
- **Depends on:** W2-C

#### Task W8-C: CI workflows + budgets + link check + 16-theme axe
- **Build:**
  - `.github/workflows/ci.yml` (spec §7.6): on push/PR → install → `sync-minnow` → `fetch-releases` → `astro build` → stylelint (hex guard) → `lychee` link check over `dist/` → `@lhci/cli` autorun (mobile preset) → `check-budgets.mjs`.
  - `.github/workflows/sync-content.yml`: daily cron **and** `repository_dispatch` → re-sync, open a PR when anything changed.
  - `scripts/check-budgets.mjs`: assert `budgets.json` against `dist/` (home HTML gz ≤22KB, all CSS gz ≤45KB, home JS gz ≤25KB, LCP image ≤180KB); exit non-zero with the offending metric on failure.
  - `scripts/check-a11y.mjs`: Playwright + `@axe-core/playwright` — load the built home page 16 times, once per `data-theme`, assert 0 axe violations (WCAG 2.1 AA).
  - `package.json`: add `lint:css`, `check:links`, `check:a11y`, `check:budgets` scripts; add `@axe-core/playwright`, `@playwright/test`, `lychee` (or action) dev deps.
- **Test:** run locally end-to-end: `npm run lint:css` passes; `npm run check:links` reports 0 broken links over `dist/`; `npm run check:budgets` passes; `npm run check:a11y` completes 16 axe runs with 0 violations; `npx lhci autorun` hits ≥98/100/100/100 (mobile).
- **Accept:** the full CI pipeline (build + stylelint + links + lighthouse + budgets + 16-theme axe) passes locally end-to-end.
- **Touches:** `.github/workflows/**`, `scripts/check-budgets.mjs`, `scripts/check-a11y.mjs`, `package.json`
- **Depends on:** W4-F, W7-C, W8-A, W8-B

#### Task W8-D: Cloudflare Pages deploy + DNS + headers
- **Build:**
  - Create the public GitHub repo `HenriGrimm/minnow-web` (AGPL-3.0-or-later licence file), push this workspace, wire the CI workflows.
  - Cloudflare Pages: `wrangler.jsonc` (`pages_build_output_dir: dist`) or the Pages GitHub integration; `public/_headers` (copied to `dist/`): `/_astro/*` → `Cache-Control: public, max-age=31536000, immutable`; HTML → `max-age=0, must-revalidate`; strict CSP allowing only `fonts.googleapis.com` / `fonts.gstatic.com` (no third-party scripts exist).
  - DNS: `minnow.sh` + `www.minnow.sh` (301 → apex).
  - `README.md`: deploy + DNS runbook.
- **Test:** deploy succeeds; `curl -sI https://minnow.sh/` returns 200 with the expected `Cache-Control` and CSP headers; `curl -sI https://www.minnow.sh/` returns 301 to apex; `curl -sI https://minnow.sh/_astro/<asset>` shows the immutable header.
- **Accept:** `minnow.sh` is live with correct headers and the www 301.
- **Touches:** `wrangler.jsonc`, `public/_headers`, `README.md`, `LICENSE`
- **Depends on:** W8-C

## Verification Checklist

- [ ] `npm run sync:minnow && npm run fetch:releases && npm run build` passes
- [ ] `npm run lint:css` — no hex/rgb/hsl outside `src/styles/vendor/tokens.css`
- [ ] `npm run check:links` — 0 broken links over `dist/`
- [ ] `npm run check:a11y` — 0 axe violations across all 16 `data-theme` values
- [ ] `npm run check:budgets` — every budget in `budgets.json` met
- [ ] `npx lhci autorun` — Performance ≥98, A11y / Best Practices / SEO = 100 (mobile)
- [ ] Content audit (spec §9): no gated surfaces, no exclamation marks, only the seven sanctioned rows, all §1.5 numbers still match the Minnow repo, README typos not reproduced
- [ ] Theme check: all 16 themes recolor the whole page including the AppFrame; `human-dark` is the default; `Auto` follows the system
- [ ] Reduced motion: every section renders at its final state with zero animation
- [ ] `minnow.sh` live with correct headers, www 301, and the daily sync workflow running

## Notes for Build Agents

- **Read the spec first.** `documentation/plans/Website Plan.md` is the source of truth for copy, token values, component recipes, and section layout. Your task description names which spec sections apply.
- **Voice is binding** (`CONTENT.md`): plain declaratives, second person, no exclamation marks, no future-tense claims, "free and open source" said once. When in doubt, write like project documentation.
- **Token discipline:** every colour comes from a `--mn-*` token. Small accent text and inline links use `--mn-accent-ink` (≈8:1), never `--mn-accent` (≈5.4:1 on the dark ground). Metric colours (`--mn-success/warning/danger`) appear only where something is genuinely measured. Never write `dark:` Tailwind variants.
- **Never hand-edit generated files:** `src/styles/vendor/tokens.css`, `src/content/docs/**`, `public/brand/**`, `src/assets/screenshots/**`, `src/data/releases.json`, `public/llms*.txt`. Change the sync/fetch scripts instead.
- **The AppFrame is DOM, not a screenshot** — that is the signature interaction. It must use the app's real sizes (14/13/11px, 52/48/300px) and recolor with every theme. Screenshots are only for the feature deep-dives.
- **Motion rules:** animate only compositor-friendly properties; nothing loops; every animation has a reduced-motion final state; stagger chains cap at 400ms; pinning uses `position: sticky` + spacer, never wheel interception.
- **No UI framework.** Vanilla TS in Astro `<script>` blocks, 20–60 lines per interactive piece. No animation libraries (GSAP/Framer/Lenis/AOS are out).
- **No client-side GitHub API calls.** Release data and star counts are fetched at build time only.
- **Banned content:** Research, Experts, Benchmarking, Compare, Super Plan, Email app, Studio app, agent-CLI providers. `app-research.png` must never be used.
- **Screenshot freshness (launch blocker, tracked as follow-up):** re-shoot `app-code.png`, `app-brain.png`, `app-models.png`, `app-issues.png`, `app-scheduler.png`, `app-source-control.png` in human-dark at 2× DPR, 16:9, real data — `hero.png` and `app-orchestrator.png` were refreshed 2026-09-11, the rest date to 2026-08-08 or earlier.
- **Non-blocking follow-ups** (do not implement in this plan): `repository_dispatch` step in the Minnow repo's release workflow; standalone `/themes` page; a blog.