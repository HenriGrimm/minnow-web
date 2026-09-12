# minnow-web

The marketing + docs website for [Minnow](https://github.com/HenriGrimm/Minnow) — a full agentic
development workspace, free and open source.

Static site: **Astro 5 + Tailwind v4**, no UI framework. The site reuses the app's `--mn-*` token
file (synced from the Minnow repo), ships all 16 themes with a live switcher, and renders the app
shell as live DOM.

## Dev commands

```bash
npm install          # install dependencies
npm run dev          # start the dev server (http://localhost:4321)
npm run build        # static build → dist/
npm run preview      # serve the built site (http://localhost:4321)
```

## Conventions

- **Token discipline:** no hex or `rgb()`/`hsl()` literal anywhere except
  `src/styles/vendor/tokens.css` (stylelint-enforced from Wave 2). Every colour comes from a
  `--mn-*` token. Never write Tailwind `dark:` variants — theme blocks re-resolve via `data-theme`.
- **Voice:** see `CONTENT.md`. Plain declaratives, second person, no exclamation marks.
- **Synced/generated files are never hand-edited:** `src/styles/vendor/tokens.css`,
  `src/content/docs/**`, `public/brand/**`, `src/assets/screenshots/**`, `src/data/releases.json`,
  `public/llms*.txt`.
