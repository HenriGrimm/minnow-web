// App surfaces (spec §1.3–§1.4). The six rail apps and the Orchestrator
// boards, which live inside Code rather than on the rail.

export type AppId = 'code' | 'source-control' | 'models' | 'brain' | 'issues' | 'scheduler' | 'orchestrator';

export interface App {
  id: AppId;
  name: string;
  blurb: string;
  /** True for the rail surfaces; the Orchestrator boards live inside Code. */
  onRail: boolean;
}

export const APPS: readonly App[] = [
  {
    id: 'code',
    name: 'Code',
    blurb:
      'The editor: LSP, inline completion, Quick Edit, terminal, dev servers, and a Chromium preview, with chat over the same repo.',
    onRail: true,
  },
  {
    id: 'source-control',
    name: 'Source Control',
    blurb:
      'Changes, history, branches, stashes, worktrees, PRs and CI, all through your own gh.',
    onRail: true,
  },
  {
    id: 'models',
    name: 'Models',
    blurb:
      'Hardware-fit scoring, Hugging Face downloads, llama-server serving, providers, per-role routing, and usage and cost.',
    onRail: true,
  },
  {
    id: 'brain',
    name: 'Brain',
    blurb:
      'A markdown wiki with semantic recall, a code index, and memories the agent can read and write.',
    onRail: true,
  },
  {
    id: 'issues',
    name: 'Issues',
    blurb:
      'List, board, triage, and saved views, with issue tools the agent files to itself.',
    onRail: true,
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    blurb:
      'Recurring agent jobs with run history, scoped to the workspace, plus /loop and /goal.',
    onRail: true,
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    blurb:
      'Boards inside Code: plan, then waves of Builder and Tester agents in isolated worktrees, then merge.',
    onRail: false,
  },
] as const;
