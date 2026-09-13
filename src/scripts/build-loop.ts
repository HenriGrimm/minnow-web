/* Pinned build loop — spec §6.2 §3, W5-D.
   The BuildLoop section's viewport (left step list + right screenshot
   cross-fade) is pinned with `position: sticky` inside a `500vh` spacer.
   The spacer is plain space — it never intercepts the wheel; the sticky
   child is what the user watches while the spacer scrolls past. As the
   user scrolls the 500vh range, the active step walks 1→5 in order:
   the active step's dot fills `--mn-accent` and its text takes `--mn-fg`,
   while the right-column screenshots cross-fade (12px y-offset, 300ms).

   Reduced motion (`prefers-reduced-motion: reduce`): the pin is removed
   and the spacer collapses, so the five steps render as five ordinary
   stacked sections. That is done in CSS (see BuildLoop.astro); here we
   simply early-return so no JS ever sets up the observers.

   No wheel/scroll listeners — the active step is derived from a single
   IntersectionObserver on per-step progress zones (one per step), the
   same "no scroll listener" pattern as nav.ts. */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type BuildLoopWindow = {
  matchMedia: (q: string) => { matches: boolean };
  document: {
    querySelectorAll: (sel: string) => NodeListOf<HTMLElement>;
    querySelector: (sel: string) => HTMLElement | null;
  };
  IntersectionObserver: typeof globalThis.IntersectionObserver;
};

// The init takes the window explicitly (defaulting to `window`) so a test
// harness can drive it without global mutation; behaviour is identical in
// the browser.
const D = (win: BuildLoopWindow | undefined): BuildLoopWindow =>
  win ?? (globalThis as unknown as BuildLoopWindow);

/**
 * Pinned build loop. The left column tracks the active step (filled
 * `--mn-accent` dot + `--mn-fg` text; inactive `--mn-fg-subtle`); the
 * right column cross-fades the screenshots. Early-returns under
 * `prefers-reduced-motion: reduce` — the CSS collapses the pin and
 * spacer so the five steps are ordinary stacked sections (spec §4.4).
 */
export function initBuildLoop(win?: BuildLoopWindow): void {
  const w = D(win);
  if (w.matchMedia(REDUCED_MOTION).matches) return;

  const steps = Array.from(
    w.document.querySelectorAll('[data-build-loop-step]'),
  ) as HTMLElement[];
  const zones = Array.from(
    w.document.querySelectorAll('[data-build-loop-zone]'),
  ) as HTMLElement[];
  const shots = Array.from(
    w.document.querySelectorAll('[data-build-loop-shot]'),
  ) as HTMLElement[];
  if (steps.length === 0 || zones.length === 0) return;

  // One progress zone per step (built in markup, evenly distributed
  // across the spacer's scroll range). Whichever zone covers the viewport
  // middle is the active step — derived purely from intersection state,
  // so there is no scroll/wheel listener to intercept the wheel.
  const observer = new w.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = Number((entry.target as HTMLElement).dataset.buildLoopZone ?? 0);
        for (let i = 0; i < steps.length; i += 1) {
          steps[i].classList.toggle('is-active', i === idx);
        }
        // The active step's screenshot cross-fades in (12px y-offset,
        // 300ms). Step 1 ("Idea") has no window — the first frame holds
        // the Orchestrator board and stays lit from step 2 on.
        const shotIdx = Math.max(0, idx - 1);
        for (let i = 0; i < shots.length; i += 1) {
          const active = i === shotIdx;
          if (active) shots[i].setAttribute('data-active-shot', '');
          else shots[i].removeAttribute('data-active-shot');
        }
      }
    },
    // Fire when a zone crosses the viewport middle band; the step list
    // is sticky so only the in-range zone intersects the band at once.
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );

  zones.forEach((zone) => observer.observe(zone));
}