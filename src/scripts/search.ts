/* Command-palette search — W7-C.
   Binds Ctrl/Cmd+K to the SearchPalette overlay (src/components/site/
   SearchPalette.astro) and drives it with the Pagefind JS API:
   - client.search(q) → rows with a lazy data() fragment (url + excerpt)
   - ↑/↓ move the selection, Enter follows the selected row, Esc closes and
     restores focus, clicking the scrim or the close button closes.
   Body scroll locks while the overlay is up. */

type PagefindResultRow = {
  id: string;
  score: number;
  words: number[];
  data?: () => Promise<{ url: string; excerpt?: string; content?: string }>;
};

type PagefindClient = {
  search: (query: string) => Promise<{
    results: PagefindResultRow[];
  }>;
};

let client: PagefindClient | null = null;
let searchTimer: number | undefined;
let selected = 0;

function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-search]');
}

function input(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('[data-search-input]');
}

function resultsEl(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-search-results]');
}

export function isOpen(): boolean {
  const p = panel();
  return !!p && p.getAttribute('aria-hidden') === 'false';
}

function setOpen(open: boolean, restoreFocus: HTMLElement | null): void {
  const p = panel();
  if (!p) return;
  p.classList.toggle('is-open', open);
  p.setAttribute('aria-hidden', String(!open));
  document.documentElement.classList.toggle('mn-search-open', open);
  if (open) {
    input()?.focus();
    input()?.select();
  } else if (restoreFocus) {
    restoreFocus.focus();
  }
}

export function openSearch(): void {
  const p = panel();
  if (!p || isOpen()) return;
  const restore = (document.activeElement as HTMLElement | null) ?? null;
  setOpen(true, restore);
}

export function closeSearch(): void {
  const p = panel();
  if (!p || !isOpen()) return;
  const inp = input();
  setOpen(false, inp ?? (document.activeElement as HTMLElement | null));
}

function crumbFor(url: string): string {
  const seg = url.split('/').filter(Boolean).slice(-2, -1)[0];
  if (!seg) return '';
  return seg
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
}

function renderRows(rows: Array<{ url: string; title: string; crumb?: string; body?: string }>): void {
  const el = resultsEl();
  if (!el) return;
  el.replaceChildren();
  selected = 0;
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'mn-search-empty';
    empty.textContent = 'No results.';
    el.appendChild(empty);
    return;
  }
  rows.forEach((row) => {
    const a = document.createElement('a');
    a.href = row.url;
    a.className = 'mn-search-row';
    a.dataset.url = row.url;

    const top = document.createElement('span');
    top.className = 'mn-search-row-top';
    const title = document.createElement('span');
    title.className = 'mn-search-row-title';
    title.textContent = row.title;
    top.appendChild(title);
    if (row.crumb) {
      const crumb = document.createElement('span');
      crumb.className = 'mn-search-row-crumb';
      crumb.textContent = row.crumb;
      top.appendChild(crumb);
    }
    a.appendChild(top);

    if (row.body) {
      const body = document.createElement('span');
      body.className = 'mn-search-row-body';
      body.textContent = row.body;
      a.appendChild(body);
    }

    el.appendChild(a);
  });
  updateSelection();
}

function updateSelection(): void {
  const rows = resultsEl()?.querySelectorAll<HTMLElement>('.mn-search-row') ?? [];
  rows.forEach((row, i) => row.classList.toggle('is-selected', i === selected));
  rows[selected]?.scrollIntoView({ block: 'nearest' });
}

function moveSelection(delta: number): void {
  const rows = resultsEl()?.querySelectorAll<HTMLElement>('.mn-search-row') ?? [];
  if (!rows.length) return;
  selected = (selected + delta + rows.length) % rows.length;
  updateSelection();
}

function runSearch(query: string): void {
  const el = resultsEl();
  if (!el) return;
  if (!client) {
    el.textContent = 'Search is unavailable.';
    return;
  }
  if (!query) {
    el.replaceChildren();
    return;
  }
  client.search(query).then(async ({ results }) => {
    // each row carries a lazy `data()` that resolves the fragment (url +
    // excerpt) — resolve them all, then render
    const resolved = await Promise.all(
      results.map(async (r) => {
        const data = typeof r.data === 'function' ? await r.data() : null;
        const url = data?.url ?? '';
        return {
          url,
          title: crumbFor(url) || url,
          crumb: crumbFor(url),
          body: (data?.excerpt || '').slice(0, 140),
        };
      }),
    );
    renderRows(resolved);
  });
}

function debouncedSearch(): void {
  const inp = input();
  if (!inp) return;
  if (searchTimer !== undefined) window.clearTimeout(searchTimer);
  const query = inp.value.trim();
  if (!query) {
    resultsEl()?.replaceChildren();
    return;
  }
  searchTimer = window.setTimeout(() => runSearch(query), 90);
}

function followSelected(): void {
  const row = resultsEl()?.querySelectorAll<HTMLElement>('.mn-search-row')[selected];
  const url = row?.dataset.url;
  if (!url) return;
  closeSearch();
  window.location.href = url;
}

/* ---------- lifecycle ---------- */

export function initSearch(): void {
  const p = panel();
  if (!p) return;

  // The built index ships its own ESM bundle at /pagefind/pagefind.js
  // (wasm-bindgen output — no global side effects). Vite would try to
  // resolve it at build time and fail (the file is written by Pagefind
  // in astro:build:done), so load it as a runtime module script and use
  // its createInstance() rather than expecting window.Pagefind.
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent =
    "import * as __pf from '/pagefind/pagefind.js';" +
    'window.__minnowPagefindClient = ' +
    '__pf.createInstance ? __pf.createInstance("/") : ' +
    '(typeof __pf.Pagefind === "function" ? new __pf.Pagefind() : null);';
  document.head.appendChild(script);
  // resolve the client once the runtime module has booted
  const poll = window.setInterval(async () => {
    const ready = (window as unknown as { __minnowPagefindClient?: PagefindClient }).__minnowPagefindClient;
    if (ready) {
      window.clearInterval(poll);
      client = ready;
    }
  }, 50);

  document.addEventListener('keydown', (e) => {
    // e.key is the canonical lowercased character — on macOS the meta key
  // remaps it to uppercase "K", so compare case-insensitively
  if ((e.metaKey || e.ctrlKey) && e.key.toUpperCase() === 'K') {
      e.preventDefault();
      isOpen() ? closeSearch() : openSearch();
      return;
    }
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (!isOpen()) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === 'Enter' && e.target === input()) {
      e.preventDefault();
      followSelected();
    }
  });

  input()?.addEventListener('input', debouncedSearch);
  p
    .querySelector<HTMLElement>('[data-search-close]')
    ?.addEventListener('click', () => closeSearch());
  p.addEventListener('click', (e) => {
    if (e.target === p) closeSearch();
  });
}