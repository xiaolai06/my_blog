/** Decode first, then dissolve; rapid choices share a bounded two-picture stage. */
type Picture = { poster: string; phase: string; srcset?: string; duration?: number };
const mounted = new WeakSet<HTMLElement>();
export function setupImageScenes() {
 document.querySelectorAll<HTMLElement>('[data-image-scene]').forEach(host => {
  if (mounted.has(host)) return;
  mounted.add(host);
  let frame = host.querySelector<HTMLElement>('.image-scene-frame')!;
  let image = frame.querySelector<HTMLImageElement>('img')!;
  let wanted: Picture | undefined;
  let busy = false;
  let visible = false;
  let fade: Animation | undefined;
  let fadeDuration = 0;
  const abort = new AbortController();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  async function pump() {
   if (busy || !visible || abort.signal.aborted) return;
   busy = true;
   while (wanted && !abort.signal.aborted) {
    const scene = wanted;
    wanted = undefined;
    host.dataset.loading = 'true';
    const nextFrame = frame.cloneNode(true) as HTMLElement;
    const next = nextFrame.querySelector<HTMLImageElement>('img')!;
    nextFrame.style.setProperty('--scene-image',`url("${scene.poster}")`);
    next.loading = 'eager';
    next.fetchPriority = 'auto';
    next.srcset = scene.srcset || '';
    next.src = scene.poster;
    try {
     await next.decode();
     if (abort.signal.aborted) break;
     if (wanted && wanted.poster !== scene.poster) continue;
     host.dataset.loading = 'false';
     host.dataset.error = 'false';
     const changed = image.getAttribute('src') !== scene.poster;
     const duration = !visible || reduced.matches || document.documentElement.dataset.motion === 'off' ? 0 : Math.min(scene.duration ?? 0, 800);
     if (changed && duration) {
      nextFrame.style.opacity = '0';
      host.append(nextFrame);
      host.dataset.transitioning = 'true';
      fadeDuration = duration;
      fade = nextFrame.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: 'linear', fill: 'both' });
      await fade.finished;
      if (abort.signal.aborted) break;
      nextFrame.style.opacity = '1';
      frame.remove(); frame = nextFrame; image = next;
      fade.cancel(); fade = undefined;
     } else { frame.style.setProperty('--scene-image',`url("${scene.poster}")`); image.srcset = scene.srcset || ''; image.src = scene.poster; }
     host.dataset.poster = scene.poster;
     host.dataset.phase = scene.phase;
     host.dataset.ready = 'true';
     host.dataset.transitioning = 'false';
     host.dispatchEvent(new CustomEvent('image-scene-settled', { bubbles: true, detail: scene }));
    } catch {
     nextFrame.remove();
     if (abort.signal.aborted) break;
     host.dataset.loading = 'false'; host.dataset.error = 'true';
     host.dispatchEvent(new CustomEvent('image-scene-error', { bubbles: true, detail: scene }));
    }
   }
   busy = false;
  }
  function change(scene: Picture) {
   wanted = scene;
   // Keep the current visual blend intact instead of snapping to its end.
   if (fade) { fade.updatePlaybackRate(Math.max(1, fadeDuration / 180)); fade.play(); }
   void pump();
  }
  const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) void pump(); }, { rootMargin: '250px 0px' });
  view.observe(host);
  host.addEventListener('image-scene-change', event => change((event as CustomEvent<Picture>).detail), { signal: abort.signal });
  reduced.addEventListener('change', () => { if (reduced.matches) fade?.finish(); }, { signal: abort.signal });
  
  function cleanup() { abort.abort(); fade?.cancel(); view.disconnect(); mounted.delete(host); }
  document.addEventListener('astro:before-swap', cleanup, { once: true, signal: abort.signal });
  window.addEventListener('pagehide', event => { if (!(event as PageTransitionEvent).persisted) cleanup(); }, { signal: abort.signal });
 });
}
