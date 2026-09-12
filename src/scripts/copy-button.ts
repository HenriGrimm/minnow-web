/* Copy button (spec §6.2 §0) — wires every [data-copy] element to
   navigator.clipboard.writeText with a transient "copied" state.
   data-copy holds the text to copy; an optional data-copy-target copies
   from that element instead. The .is-copied class is dropped after
   2 seconds so the button can be reused. */

const COPIED_MS = 2000;

export function initCopyButtons(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-copy]'));
  for (const button of buttons) {
    if (button.dataset.copyBound === '1') continue;
    button.dataset.copyBound = '1';
    button.addEventListener('click', () => {
      void copyButton(button);
    });
  }
}

async function copyButton(button: HTMLElement): Promise<void> {
  let text: string | null = button.getAttribute('data-copy');
  const target = button.getAttribute('data-copy-target');
  if (target) {
    text = document.querySelector<HTMLElement>(target)?.textContent ?? text;
  }
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard can be unavailable (non-secure context); nothing to do.
    return;
  }

  button.classList.add('is-copied');
  if (button.getAttribute('data-copy-label') === null) {
    button.setAttribute('data-copy-label', button.textContent ?? '');
  }
  if (button.textContent !== null && button.textContent !== undefined) {
    button.textContent = 'Copied';
  }
  window.setTimeout(() => {
    button.classList.remove('is-copied');
    const label = button.getAttribute('data-copy-label');
    if (label !== null && button.textContent !== null && button.textContent !== undefined) {
      button.textContent = label;
    }
    button.removeAttribute('data-copy-label');
  }, COPIED_MS);
}
