/* Theme runtime — ported from Minnow's src/theme.ts. Spec §7.4.
   Storage keys are identical to the app's so the site and the app speak the
   same dialect: minnow.theme, minnow.theme.followSystem, minnow.theme.family. */

export const THEME_FAMILIES = ['swamp', 'desert', 'ocean', 'coral', 'mono', 'matrix', 'human', 'mint'] as const;
export const THEME_MODES = ['dark', 'light'] as const;
export const DEFAULT_THEME_ID = 'human-dark'; // site default (the app's is swamp-dark)

export type ThemeFamily = (typeof THEME_FAMILIES)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeId = `${ThemeFamily}-${ThemeMode}`;

export const THEME_IDS: readonly ThemeId[] = (
  THEME_FAMILIES as readonly ThemeFamily[]
).flatMap((family) => THEME_MODES.map((mode) => `${family}-${mode}` as ThemeId));

const KEY_THEME = 'minnow.theme';
const KEY_FOLLOW_SYSTEM = 'minnow.theme.followSystem';
const KEY_FAMILY = 'minnow.theme.family';

const mediaLight =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: light)')
    : undefined;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // private mode / quota — the theme still applies for this page load
  }
}

function isValidId(id: unknown): id is ThemeId {
  return typeof id === 'string' && (THEME_IDS as readonly string[]).includes(id);
}

function currentId(): ThemeId {
  const stored = read(KEY_THEME);
  if (isValidId(stored)) {
    return stored;
  }
  const family = read(KEY_FAMILY);
  const mode: ThemeMode =
    mediaLight && read(KEY_FOLLOW_SYSTEM) === '1'
      ? mediaLight.matches
        ? 'light'
        : 'dark'
      : 'dark';
  const id = `${family && (THEME_FAMILIES as readonly string[]).includes(family) ? family : 'human'}-${mode}`;
  return isValidId(id) ? id : DEFAULT_THEME_ID;
}

function syncThemeColor(): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--mn-bg').trim();
  if (bg) meta.setAttribute('content', bg);
}

/** Set the page theme. Persists the choice to localStorage under the app's
 *  key names. Idempotent when the id is already applied. */
export function applyTheme(id: string): void {
  const themeId: ThemeId = isValidId(id) ? id : DEFAULT_THEME_ID;
  const [family, mode] = themeId.split('-') as [ThemeFamily, ThemeMode];

  const root = document.documentElement;
  root.classList.add('theme-no-transition');
  root.setAttribute('data-theme', themeId);
  root.style.colorScheme = mode;

  write(KEY_THEME, themeId);
  write(KEY_FAMILY, family);
  // followSystem is opt-in (the Auto segment); a manual pick never touches it.

  syncThemeColor();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-no-transition');
      root.classList.add('theme-ready');
    });
  });
}

/** Turn on follow-system mode for the current family (the Auto segment).
 *  Persists minnow.theme.followSystem = '1' and applies the resulting theme. */
export function applyFollowSystem(): void {
  const family = (read(KEY_FAMILY) as ThemeFamily | null) ?? 'human';
  const valid = (THEME_FAMILIES as readonly string[]).includes(family)
    ? family
    : 'human';
  const mode: ThemeMode = mediaLight && mediaLight.matches ? 'light' : 'dark';
  write(KEY_FOLLOW_SYSTEM, '1');
  applyTheme(`${valid}-${mode}`);
}

/** Read the current state without applying anything. For the switcher UI. */
export function themeState(): {
  id: ThemeId;
  family: ThemeFamily;
  mode: ThemeMode;
  followSystem: boolean;
} {
  const id = currentId();
  const [family, mode] = id.split('-') as [ThemeFamily, ThemeMode];
  return {
    id,
    family,
    mode,
    followSystem: read(KEY_FOLLOW_SYSTEM) === '1',
  };
}

/** Boot the theme from localStorage. Idempotent — safe to call again. */
export function initTheme(): void {
  applyTheme(currentId());

  mediaLight?.addEventListener('change', () => {
    if (read(KEY_FOLLOW_SYSTEM) === '1') {
      const family = (read(KEY_FAMILY) as ThemeFamily | null) ?? 'human';
      const mode: ThemeMode = mediaLight.matches ? 'light' : 'dark';
      applyTheme(`${family}-${mode}`);
    }
  });
}