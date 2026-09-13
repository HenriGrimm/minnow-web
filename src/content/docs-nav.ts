/**
 * Docs navigation — the hand-maintained nav tree (order + labels) for the
 * docs section (spec §6.4, §7.5). Covers manual / contributor / plugins /
 * roadmap.
 *
 * This file does double duty in the build-failure guards (spec §7.5):
 *
 *  1. NAV VALIDATION — every `page` entry must match a synced file under
 *     src/content/docs/**, and every synced file must appear here. A nav
 *     entry with no matching file, or a synced file absent from the nav,
 *     fails the sync loudly.
 *
 *  2. GATED-SURFACE ALLOWLIST — the Minnow ROADMAP (and the wiki's
 *     reference/roadmap stub) legitimately describe the surfaces behind the
 *     release gate (Research, Experts, Benchmarking, Compare, Super Plan).
 *     Those exact pages are the explicit allowlist for mentioning them:
 *     any OTHER synced doc or site string mentioning a gated surface fails
 *     the sync loudly.
 *
 * Edit this file when docs are added upstream; re-run `npm run sync:minnow`.
 */

export interface DocsNavItem {
  /** Display label in the nav. */
  label: string;
  /** Optional: this is a section header, not a linkable page. */
  section?: boolean;
  /** Optional: linkable page — must match a synced file under src/content/docs. */
  page?: string;
  /** Optional: nested items. */
  children?: DocsNavItem[];
}

export const DOCS_NAV: DocsNavItem[] = [
  {
    label: 'Manual',
    section: true,
    children: [
      { label: 'Overview', page: 'manual/README.md' },
      {
        label: 'Get started',
        section: true,
        children: [
          { label: 'Install', page: 'manual/get-started/install.md' },
          { label: 'Connect a model', page: 'manual/get-started/connect-a-model.md' },
          { label: 'First chat', page: 'manual/get-started/first-chat.md' },
        ],
      },
      {
        label: 'Concepts',
        section: true,
        children: [
          { label: 'How Minnow works', page: 'manual/concepts/how-minnow-works.md' },
          { label: 'Modes', page: 'manual/concepts/modes.md' },
          {
            label: 'Tools & permissions',
            page: 'manual/concepts/tools-and-permissions.md',
          },
          { label: 'Context & memory', page: 'manual/concepts/context-and-memory.md' },
        ],
      },
      {
        label: 'Chat',
        section: true,
        children: [
          { label: 'Chatting', page: 'manual/chat/chatting.md' },
          {
            label: 'Skills & commands',
            page: 'manual/chat/skills-and-commands.md',
          },
        ],
      },
      {
        label: 'Apps',
        section: true,
        children: [
          { label: 'Overview', page: 'manual/apps/overview.md' },
          { label: 'Code', page: 'manual/apps/code.md' },
          { label: 'Models', page: 'manual/apps/models.md' },
          { label: 'Issues', page: 'manual/apps/issues.md' },
          { label: 'Brain', page: 'manual/apps/brain.md' },
          { label: 'Scheduler', page: 'manual/apps/scheduler.md' },
          { label: 'Settings', page: 'manual/apps/settings.md' },
        ],
      },
      {
        label: 'Orchestrate',
        section: true,
        children: [
          { label: 'Boards', page: 'manual/orchestrate/boards.md' },
          { label: 'Agents', page: 'manual/orchestrate/agents.md' },
        ],
      },
      {
        label: 'Extend',
        section: true,
        children: [
          { label: 'Integrations', page: 'manual/extend/integrations.md' },
          { label: 'Voice', page: 'manual/extend/voice.md' },
          { label: 'LAN companion', page: 'manual/extend/companion.md' },
        ],
      },
      {
        label: 'Reference',
        section: true,
        children: [
          { label: 'Keyboard shortcuts', page: 'manual/reference/keyboard-shortcuts.md' },
          { label: 'Configuration', page: 'manual/reference/configuration.md' },
          { label: 'Privacy & security', page: 'manual/reference/privacy-and-security.md' },
          { label: 'Troubleshooting', page: 'manual/reference/troubleshooting.md' },
          { label: 'Glossary', page: 'manual/reference/glossary.md' },
          { label: 'Wiki & Brain', page: 'manual/reference/wiki-and-brain.md' },
          {
            label: 'Roadmap (wiki stub)',
            page: 'manual/reference/roadmap.md',
          },
        ],
      },
    ],
  },
  {
    label: 'Contributor',
    section: true,
    children: [
      { label: 'Overview', page: 'contributor/README.md' },
      { label: 'Architecture', page: 'contributor/architecture.md' },
      { label: 'Set up from source', page: 'contributor/setup-from-source.md' },
      { label: 'Commands', page: 'contributor/commands.md' },
      { label: 'Apps & routes', page: 'contributor/apps-and-routes.md' },
      { label: 'Orchestrate board testing', page: 'contributor/orchestrate-board-testing.md' },
      { label: 'LAN companion', page: 'contributor/lan-companion.md' },
      { label: 'Accessibility audit', page: 'contributor/accessibility-audit.md' },
    ],
  },
  {
    label: 'Plugins',
    section: true,
    children: [{ label: 'Tool authoring', page: 'plugins/tool-authoring.md' }],
  },
  { label: 'Roadmap', page: 'roadmap.md' },
];

/**
 * The explicit allowlist for mentioning release-gated surfaces (Research,
 * Experts, Benchmarking, Compare, Super Plan). These are the pages whose job
 * is to describe work not yet shipped — the wiki's reference/roadmap stub
 * and the full ROADMAP. Any other synced doc mentioning a gated surface is a
 * content bug and fails the sync loudly.
 */
export const GATED_SURFACE_ALLOWLIST: string[] = [
  // The roadmap — the one page that talks about work not yet shipped.
  'manual/reference/roadmap.md',
  'roadmap.md',
  // Contributor docs that document the release-gated apps and modes
  // (Compare, Benchmarking, Experts, Research, Super Plan) as part of the
  // architecture and developer documentation. These are the explicit
  // allowlist for mentioning a gated surface.
  'contributor/apps-and-routes.md',
  'contributor/setup-from-source.md',
  'contributor/architecture.md',
  'contributor/accessibility-audit.md',
  'contributor/commands.md',
];