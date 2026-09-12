// Site-wide constants (spec §1.1).

export const SITE = {
  url: 'https://minnow.sh',
  repo: 'HenriGrimm/Minnow',
  repoUrl: 'https://github.com/HenriGrimm/Minnow',
  discord: 'https://discord.gg/U4FPzv9K4X',
  sponsor: 'https://github.com/sponsors/HenriGrimm',
  author: 'Henri Grimm',
  authorEmail: 'henri@grimmedia.org',
  version: '0.1.3',
} as const;

export type Site = typeof SITE;