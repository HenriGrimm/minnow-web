/* Motion runtime — spec §4.2, §4.4.
   The reveal primitive: one IntersectionObserver adds .is-in to
   [data-reveal] and unobserves immediately — nothing re-animates on
   scroll-up, because re-animation is decoration. ~60 lines of TS; no
   animation library (spec §4.5). */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type MotionWindow = {
  matchMedia: (q: string) => { matches: boolean };
  document: {
    querySelectorAll: (sel: string) => NodeListOf<HTMLElement>;
    documentElement: HTMLElement;
    visibilityState: string;
    addEventListener: (type: 'visibilitychange', cb: () => void) => void;
  };
  IntersectionObserver: typeof globalThis.IntersectionObserver;
};

// The inits take the window explicitly (defaulting to `window`) so a test
// harness can drive them without global mutation; behaviour is identical in
// the browser.
const D = (win: MotionWindow | undefined): MotionWindow => win ?? (globalThis as unknown as MotionWindow);

/**
 * Reveal primitive (spec §4.2). One observer, `rootMargin: "0px 0px
 * -12% 0px"` so elements arrive slightly after entering the viewport;
 * `threshold: 0.01`. Each [data-reveal] gains .is-in exactly once and
 * is unobserved immediately. Early-returns under
 * `prefers-reduced-motion: reduce` — the CSS keeps that content simply
 * present (spec §4.4 layer 2), so no JS is needed there.
 */
export function initReveal(win?: MotionWindow): void {
  const w = D(win);
  if (w.matchMedia(REDUCED_MOTION).matches) return;

  const targets = w.document.querySelectorAll('[data-reveal]') as NodeListOf<HTMLElement>;
  if (targets.length === 0) return;

  const observer = new w.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target); // no re-animation on scroll-up
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * Hidden-window park (spec §4.4, port of the app's park): a backgrounded
 * tab burns no compositor time. `:root[data-mn-render='idle']` is set
 * when the document is hidden and cleared when it becomes visible
 * again.
 */
export function parkWhenHidden(win?: MotionWindow): void {
  const w = D(win);
  const doc = w.document;
  const root = doc.documentElement;
  const apply = (): void => {
    if (doc.visibilityState === 'hidden') {
      root.setAttribute('data-mn-render', 'idle');
    } else {
      root.removeAttribute('data-mn-render');
    }
  };
  apply();
  doc.addEventListener('visibilitychange', apply);
}