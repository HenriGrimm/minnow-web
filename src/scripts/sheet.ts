/* Mobile nav sheet — spec §6.1.
   Hamburger toggles a full-height sheet that slides from the right
   (translateX(100%) → 0, --duration-normal --ease-out) over a --mn-overlay
   scrim. Body scroll locks while open; Esc closes; focus returns to the
   hamburger on close. */

export function initSheet(): void {
  const burger = document.querySelector<HTMLButtonElement>('[data-sheet-toggle]');
  const sheet = document.querySelector<HTMLElement>('[data-sheet]');
  const scrim = document.querySelector<HTMLElement>('[data-sheet-scrim]');
  if (!burger || !sheet || !scrim) return;

  const setOpen = (open: boolean): void => {
    sheet.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('mn-sheet-open', open);
    if (open) {
      sheet.setAttribute('aria-hidden', 'false');
      (sheet.querySelector<HTMLElement>('a, button') ?? sheet).focus();
    } else {
      sheet.setAttribute('aria-hidden', 'true');
      burger.focus();
    }
  };

  burger.addEventListener('click', () => {
    setOpen(!sheet.classList.contains('is-open'));
  });
  sheet
    .querySelector<HTMLButtonElement>('[data-sheet-close]')
    ?.addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  sheet
    .querySelectorAll<HTMLAnchorElement>('a[href]')
    .forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) setOpen(false);
  });
}