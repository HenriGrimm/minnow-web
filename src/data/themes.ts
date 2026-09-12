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
