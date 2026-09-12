// Home page FAQ (spec §6.2 §13). Ten items, written in voice: plain,
// unhurried, no exclamation marks, nothing in the future tense.

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: readonly FaqItem[] = [
  {
    question: 'What is Minnow?',
    answer:
      'A full agentic development workspace, free and open source. It puts the editor, agents, git, issues, planning, knowledge, and local model hosting in one app, designed from the ground up to work with each other. It is for the solo developer and the hobbyist, single-player by design.',
  },
  {
    question: 'Is it really free?',
    answer:
      'Yes. The whole app is free, under AGPL-3.0-or-later, with no paid tier. No feature is ever withheld to make one. Sponsorship is welcome but never changes what you get.',
  },
  {
    question: 'Do I need an API key?',
    answer:
      'Only if you want to use a cloud provider. Point it at one of the nine cloud providers with your own key, or run local models with no account at all. Local is the full product, not a trial.',
  },
  {
    question: 'Does it work fully offline?',
    answer:
      'With local models, yes. Your code, your chats, and your notes stay on your disk in ~/.minnow. Nothing leaves unless you sent it somewhere yourself, and there is no telemetry or phone-home.',
  },
  {
    question: 'Which platforms?',
    answer:
      'Windows, macOS, and Linux. Native installs: an NSIS installer on Windows, a dmg or zip on macOS, an AppImage on Linux.',
  },
  {
    question: 'Is my code sent anywhere?',
    answer:
      'Not by default. Local models keep everything on your machine. If you use a cloud provider, the prompt and the context you include go to that provider, which is the normal trade of using one. There is no other destination.',
  },
  {
    question: 'Can my team use it?',
    answer:
      'It is single-player by design, and it does not pretend otherwise. One workspace, one operator. It is a tool for the person in front of the keyboard, not a platform for teams or organizations.',
  },
  {
    question: 'How is it different from Cursor?',
    answer:
      'Cursor is an editor with a chat panel attached. Minnow is a workspace where the editor, the git client, the issue tracker, the knowledge base, and the model hosting share one chat engine, one tool set, and one session store. What the agent learns in one surface is available in all of them.',
  },
  {
    question: 'Windows says the installer is unrecognised — why?',
    answer:
      'That is SmartScreen, which is cautious about installers that are new and not yet widely downloaded. In the warning, choose More info, then Run anyway. The signature is the normal one from a new developer, and it goes away as more people run it.',
  },
  {
    question: 'What does AGPL mean for me?',
    answer:
      'You can run it, read it, and change it. If you distribute a modified version, or run it as a network service, the source has to stay open under the same terms. For most people who simply install and use it, the licence is a promise, not an obligation.',
  },
] as const;
