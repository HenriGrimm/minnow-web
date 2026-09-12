// The seven sanctioned replacement rows (spec §1.4). Nothing outside this
// list may be claimed, and each row is paired with what the integration buys.

export interface ReplaceRow {
  insteadOf: string;
  youGet: string;
  honestBecause: string;
}

export const REPLACES: readonly ReplaceRow[] = [
  {
    insteadOf: 'Cursor, or VS Code plus a chat extension',
    youGet: 'Code',
    honestBecause:
      'LSP, inline completion, Quick Edit, terminal, dev servers, Chromium preview, and chat over the same repo.',
  },
  {
    insteadOf: 'Linear, Jira (single-player)',
    youGet: 'Issues',
    honestBecause:
      'List, board, triage, saved views, and issue tools the agent files to itself.',
  },
  {
    insteadOf: 'GitHub Desktop, Tower',
    youGet: 'Source Control Center',
    honestBecause:
      'Changes, history, branches, stashes, worktrees, PRs and CI via your own gh.',
  },
  {
    insteadOf: 'LM Studio',
    youGet: 'Models',
    honestBecause:
      'Hardware-fit scoring, HF downloads, llama-server serving, providers, per-role routing, usage and cost.',
  },
  {
    insteadOf: 'Notion or Obsidian, for project notes',
    youGet: 'Brain',
    honestBecause:
      'Markdown wiki, semantic recall, code index, memories, and agent read/write.',
  },
  {
    insteadOf: 'A drawer of shell scripts and cron',
    youGet: 'Scheduler, /loop, /goal',
    honestBecause:
      'Recurring agent jobs with run history, scoped to the workspace.',
  },
  {
    insteadOf: 'A hand-rolled CI or agent-runner pipeline',
    youGet: 'Orchestrator boards',
    honestBecause:
      'Plan, then waves of Builder and Tester agents in isolated worktrees, then merge.',
  },
] as const;
