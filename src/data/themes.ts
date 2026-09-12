// Theme families (spec §3.3). Eight families, sixteen themes: each family
// ships a dark and a light id. Names and blurbs are for the switcher UI.

export type ThemeFamilyId =
  | 'swamp'
  | 'desert'
  | 'ocean'
  | 'coral'
  | 'mono'
  | 'matrix'
  | 'human'
  | 'mint';

export interface ThemeFamily {
  id: ThemeFamilyId;
  name: string;
  blurb: string;
  /** Full theme id for the dark variant. */
  dark: string;
  /** Full theme id for the light variant. */
  light: string;
}

export const THEME_FAMILIES: readonly ThemeFamily[] = [
  {
    id: 'swamp',
    name: 'Swamp',
    blurb: 'Cool neutrals, muted green accent. Calm and editor-like.',
    dark: 'swamp-dark',
    light: 'swamp-light',
  },
  {
    id: 'desert',
    name: 'Desert',
    blurb: 'Warm taupe neutrals with an amber accent. Cozy for long sessions.',
    dark: 'desert-dark',
    light: 'desert-light',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    blurb: 'Blue-tinted neutrals with a soft cyan accent. Modern dev-tool feel.',
    dark: 'ocean-dark',
    light: 'ocean-light',
  },
  {
    id: 'coral',
    name: 'Coral',
    blurb: 'Graphite neutrals with a warm coral accent. Distinct and soft-modern.',
    dark: 'coral-dark',
    light: 'coral-light',
  },
  {
    id: 'mono',
    name: 'Mono',
    blurb: 'Pure grayscale. Proof on newsprint, bench in charcoal.',
    dark: 'mono-dark',
    light: 'mono-light',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    blurb: 'Phosphor green on CRT black. Accent-only green, readable long sessions.',
    dark: 'matrix-dark',
    light: 'matrix-light',
  },
  {
    id: 'human',
    name: 'Human',
    blurb:
      'Near-black ground with burnt orange accent and peach cream text. Warm evening sessions.',
    dark: 'human-dark',
    light: 'human-light',
  },
  {
    id: 'mint',
    name: 'Mint',
    blurb:
      'Cool charcoal neutrals with mint phosphor accent and icy cyan highlights.',
    dark: 'mint-dark',
    light: 'mint-light',
  },
] as const;

/** The site's localStorage keys — identical to the app's (spec §7.4), so a
 *  pick here and a pick in the app agree across the two surfaces. */
export const THEME_STORAGE_KEYS = {
  theme: 'minnow.theme',
  family: 'minnow.theme.family',
} as const;

export interface ThemePreviewColors {
  /** `--mn-bg` */
  bg: string;
  /** `--mn-surface-2` */
  s2: string;
  /** `--mn-accent` */
  accent: string;
  /** `--mn-fg` */
  fg: string;
}

/** Static four-swatch colour map (bg / surface-2 / accent / fg) for every
 *  family×mode. Display-only — the live page recolours through the vendored
 *  --mn-* tokens; these fixed values let each card show its target family's
 *  true colours regardless of the page's current theme. Sourced from
 *  src/styles/vendor/tokens.css (the same convention the ThemeSwitcher
 *  picker swatches use). */
export const THEME_SWATCHES: Record<
  `${ThemeFamilyId}-${'dark' | 'light'}`,
  ThemePreviewColors
> = {
  'swamp-dark': { bg: '#0f1216', s2: '#1f242b', accent: '#9ec5a7', fg: '#dfe3e8' },
  'swamp-light': { bg: '#f7f7f4', s2: '#ededea', accent: '#5b8a72', fg: '#1c2127' },
  'desert-dark': { bg: '#16140f', s2: '#27231b', accent: '#d4a574', fg: '#e8dcc6' },
  'desert-light': { bg: '#f7f4ec', s2: '#ebe6d8', accent: '#a36f2a', fg: '#2a2418' },
  'ocean-dark': { bg: '#0d1117', s2: '#1d2632', accent: '#7dd3e8', fg: '#dde4ed' },
  'ocean-light': { bg: '#f4f6f9', s2: '#e4e9f0', accent: '#2b7a96', fg: '#1a2230' },
  'coral-dark': { bg: '#141416', s2: '#27272b', accent: '#f5a3a0', fg: '#e6e4e1' },
  'coral-light': { bg: '#fafaf8', s2: '#ededea', accent: '#c75651', fg: '#1c1c1f' },
  'mono-dark': { bg: '#2b2b2b', s2: '#3a3a3a', accent: '#d4d4d4', fg: '#e8e8e8' },
  'mono-light': { bg: '#f7f7f7', s2: '#d4d4d4', accent: '#2b2b2b', fg: '#2b2b2b' },
  'matrix-dark': { bg: '#040604', s2: '#111711', accent: '#28d250', fg: '#dce8dc' },
  'matrix-light': { bg: '#eef2ee', s2: '#d6dcd6', accent: '#0a6b28', fg: '#0a120a' },
  'human-dark': { bg: '#0f0f0f', s2: '#262626', accent: '#d27428', fg: '#ffdbbd' },
  'human-light': { bg: '#fbf1ea', s2: '#eee5de', accent: '#c46820', fg: '#2e2218' },
  'mint-dark': { bg: '#141615', s2: '#3a3b3a', accent: '#66ffb0', fg: '#ffffff' },
  'mint-light': { bg: '#f2faf6', s2: '#e6eeea', accent: '#1fa86a', fg: '#121a16' },
};
