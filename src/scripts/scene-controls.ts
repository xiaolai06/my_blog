/** The selected tab glides in the same small control family in both scenes. */
const observed = new WeakSet<HTMLElement>();
export function syncSceneSelection(group: HTMLElement | null) {
 if (!group) return;
 const selected = group.querySelector<HTMLButtonElement>('button[aria-pressed=true]');
 if (!selected) return;
 group.querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.tabIndex = button === selected ? 0 : -1; });
 group.style.setProperty('--selection-x', `${selected.offsetLeft}px`);
 group.style.setProperty('--selection-width', `${selected.offsetWidth}px`);
 group.dataset.selectionReady = 'true';
 if (observed.has(group)) return;
 observed.add(group);
 group.addEventListener('keydown', event => {
  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
   (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
  buttons[next]?.click();
 });
 const resize = new ResizeObserver(() => syncSceneSelection(group));
 resize.observe(group);
 document.addEventListener('astro:before-swap', () => resize.disconnect(), { once: true });
}
