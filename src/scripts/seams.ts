/* Seam diagram scroll scrub — spec §6.2 §2, W5-C.
   One progress custom property `--p` (0→1) scrubs the five-tile diagram
   over the lifetime of the section: tiles slide together, gaps close to
   zero, the five 1px borders resolve into one continuous hairline
   rectangle, and the caption swaps to the joined state. All per-element
   motion is `transform` (gap widths are a precomputed function of the
   same `--p`, so nothing else animates); the only non-transform swap is
   the caption crossfade (opacity, text swap at the midpoint).

   Native scroll-driven animation (`animation-timeline: view()`) drives
   `--p` where available — @supports in the component CSS. The JS
   fallback here is one rAF-throttled scroll listener writing `--p` on
   the pinned section only (a no-op when the native path is active).
   Reversible by construction: `--p` is a pure function of scroll
   position. Reduced motion → final state, zero listeners. */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type SeamsWindow = {
  matchMedia: (q: string) => { matches: boolean };
  document: {
    querySelector: (sel: string) => HTMLElement | null;
    addEventListener: (type: string, cb: () => void, opts?: { passive: boolean }) => void;
    documentElement: HTMLElement;
    defaultView: { innerHeight: number } | null;
  };
  CSS: { supports: (q: string) => boolean };
  requestAnimationFrame: (cb: () => void) => number;
};

const D = (win: SeamsWindow | undefined): SeamsWindow =>
  win ?? (globalThis as unknown as SeamsWindow);

export function initSeams(win?: SeamsWindow): void {
  const w = D(win);
  const section = w.document.querySelector<HTMLElement>('[data-seams]');
  if (!section) return;

  // Reduced motion: the diagram renders in its final joined state (CSS),
  // and there is no scrub at all.
  if (w.matchMedia(REDUCED_MOTION).matches) return;

  // Native scroll-driven animation is available — CSS owns `--p`;
  // adding a scroll listener would just write the same value twice.
  if (w.CSS.supports('animation-timeline: view()')) return;

  // JS fallback: one scroll listener, rAF-throttled, writing `--p` on
  // the pinned section only. Fully reversible — position → progress is a
  // pure function, recomputed from the live rect on every frame.
  let ticking = false;
  const update = (): void => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh =
      w.document.defaultView?.innerHeight ??
      w.document.documentElement.clientHeight;
    const denom = vh + rect.height || 1;
    const p = Math.min(1, Math.max(0, (vh - rect.top) / denom));
    section.style.setProperty('--p', String(p));
  };
  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    w.requestAnimationFrame(update);
  };
  update();
  w.document.addEventListener('scroll', onScroll, { passive: true });
}
