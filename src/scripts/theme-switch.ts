/* ThemeSwitcher runtime — spec §6.1.
   Segments: Dark · Light · Auto (Auto = followSystem, the app's own model).
   The caret (or a long-press on a segment) opens the 8-family picker.
   Every choice goes through applyTheme / applyFollowSystem in theme.ts
   so the storage keys stay identical to the app. */

import {
  applyTheme,
  applyFollowSystem,
  themeState,
} from './theme';

type Mode = 'dark' | 'light' | 'auto';

const HOLD_MS = 450;

function segmentState(): Mode {
  const s = themeState();
  if (s.followSystem) return 'auto';
  return s.mode;
}

function syncSegments(root: HTMLElement): void {
  const mode = segmentState();
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function syncFamilies(root: HTMLElement): void {
  const family = themeState().family;
  root.querySelectorAll<HTMLButtonElement>('[data-family]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.family === family);
  });
}

export function initThemeSwitcher(root: HTMLElement): void {
  const picker = root.querySelector<HTMLElement>('[data-theme-picker]');
  const caret = root.querySelector<HTMLButtonElement>('[data-theme-caret]');

  syncSegments(root);
  syncFamilies(root);

  const isOpen = (): boolean => picker?.classList.contains('is-open') ?? false;
  const setOpen = (open: boolean): void => {
    if (!picker) return;
    picker.classList.toggle('is-open', open);
    caret?.setAttribute('aria-expanded', String(open));
    root.setAttribute('aria-expanded', String(open));
  };
  const close = (): void => setOpen(false);

  // Segments — Dark / Light / Auto. A manual pick clears follow-system
  // (Auto is opt-in, exactly as in the app).
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    const pick = () => {
      const mode = btn.dataset.mode as Mode;
      if (mode === 'auto') {
        applyFollowSystem();
      } else {
        const family = themeState().family;
        try {
          localStorage.removeItem('minnow.theme.followSystem');
        } catch {
          /* private mode — state still applies for this page load */
        }
        applyTheme(`${family}-${mode}`);
      }
      syncSegments(root);
      syncFamilies(root);
    };

    btn.addEventListener('click', pick);

    // Long-press on a segment opens the family picker instead.
    let timer: number | undefined;
    let held = false;
    btn.addEventListener('pointerdown', () => {
      held = false;
      timer = window.setTimeout(() => {
        held = true;
        setOpen(true);
      }, HOLD_MS);
    });
    const cancelHold = () => window.clearTimeout(timer);
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('click', (e) => {
      if (held) {
        // The hold already opened the picker; swallow this click so the
        // segment's own handler does not fire.
        e.stopImmediatePropagation();
        e.preventDefault();
        held = false;
      }
    }, true);
  });

  // Family picker rows — set the family, keep the current mode
  // (Auto resolves through the system preference).
  root.querySelectorAll<HTMLButtonElement>('[data-family]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const family = btn.dataset.family as string;
      const s = themeState();
      const mode = s.followSystem
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : s.mode;
      applyTheme(`${family}-${mode}`);
      syncSegments(root);
      syncFamilies(root);
      close();
    });
  });

  // Caret toggles the picker.
  caret?.addEventListener('click', () => setOpen(!isOpen()));

  // Close on outside click or Escape.
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}