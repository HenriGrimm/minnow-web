/* Nav scroll state — spec §6.1.
   A single IntersectionObserver on a sentinel div sits just above the
   nav; when the sentinel scrolls out of view the nav gets .is-scrolled
   and its 1px bottom border fades in over 150ms (CSS transition).
   No scroll listener anywhere. */

export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const sentinel = document.querySelector<HTMLElement>('[data-nav-sentinel]');
  if (!nav || !sentinel) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        nav.classList.toggle('is-scrolled', !entry.isIntersecting);
      }
    },
    { threshold: 0 },
  );
  observer.observe(sentinel);
}