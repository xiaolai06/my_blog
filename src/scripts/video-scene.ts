/** Real, pre-rendered films. The next film is decoded before it can enter the
 * compositor; rapid requests coalesce without resetting the visible dissolve. */
export type VideoSceneChange = { src: string; poster: string; phase: string; duration?: number };
type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};
const mounted = new WeakSet<HTMLElement>();

export function setupVideoScenes() {
  document.querySelectorAll<HTMLElement>('[data-video-scene]').forEach(host => {
    if (mounted.has(host)) return;
    mounted.add(host);
    createVideoScene(host);
  });
}

function createVideoScene(host: HTMLElement) {
  const reference = host.querySelector<HTMLImageElement>('.video-scene-reference')!;
  const stage = host.querySelector<HTMLElement>('.video-scene-stage')!;
  const fallback = host.querySelector<HTMLImageElement>('.video-scene-fallback')!;
  const films = Array.from(host.querySelectorAll<FrameVideo>('video'));
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let current: VideoSceneChange | undefined;
  let wanted: VideoSceneChange | undefined;
  let busy = false;
  let visible = false;
  let disposed = false;
  let fade: Animation | undefined;
  let fadingSlot = -1;
  let fadingScene: VideoSceneChange | undefined;
  let returning = false;
  let fadeDuration = 0;
  let resizing = 0;
  let loadingFilm: FrameVideo | undefined;
  let loadingAbort: AbortController | undefined;
  let playRevision = 0;

  function emit(name: string, scene: VideoSceneChange) {
    host.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { src: scene.src, phase: scene.phase } }));
  }

  function allowed() {
    return visible && !document.hidden && !reduced.matches && root.dataset.motion !== 'off' && !root.hasAttribute('data-page-hidden');
  }

  function syncPlayback() {
    const revision = ++playRevision;
    const moving = allowed();
    host.dataset.running = 'false';
    films.forEach((film, index) => {
      const shown = index === active || index === fadingSlot;
      if (moving && shown && film.readyState >= 2) {
        void film.play().then(() => {
          const stillShown = index === active || index === fadingSlot;
          // An older play() promise must never pause a newer, valid play().
          if (disposed || !allowed()) {
            film.pause();
            return;
          }
          if (!stillShown && film !== loadingFilm) {
            film.pause();
            return;
          }
          if (revision !== playRevision) return;
          host.dataset.running = String(!film.paused && stillShown);
        }).catch(() => { /* The decoded frame and poster remain a valid fallback. */ });
      } else if (!moving || film !== loadingFilm) film.pause();
    });
    if (!moving && fade) fade.finish();
  }

  function resize() {
    resizing = 0;
    if (disposed) return;
    const style = getComputedStyle(reference);
    Object.assign(stage.style, {
      left: `${reference.offsetLeft}px`, top: `${reference.offsetTop}px`,
      width: `${reference.offsetWidth}px`, height: `${reference.offsetHeight}px`,
      right: 'auto', bottom: 'auto', margin: '0', maxWidth: 'none',
      objectFit: style.objectFit, objectPosition: style.objectPosition,
      filter: style.filter, maskImage: style.maskImage,
      maskSize: style.maskSize, maskPosition: style.maskPosition,
      maskRepeat: style.maskRepeat, zIndex: style.zIndex,
    });
  }

  function scheduleResize() {
    if (!resizing) resizing = requestAnimationFrame(resize);
  }

  function waitForFrame(film: FrameVideo, scene: VideoSceneChange, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      let frame = 0;
      let frameTimeout = 0;
      let seekTimeout = 0;
      let metadataReady = false;
      let aligning = false;
      let waitingFrame = false;
      let corrections = 0;
      let seekStarted = 0;
      let seekLead = 0;
      const timeout = window.setTimeout(() => finish(new Error('Scene film timed out')), 20_000);
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout); clearTimeout(frameTimeout); clearTimeout(seekTimeout);
        if (frame) film.cancelVideoFrameCallback?.(frame);
        film.removeEventListener('loadedmetadata', metadata);
        film.removeEventListener('seeked', seeked);
        film.removeEventListener('loadeddata', decoded);
        film.removeEventListener('canplay', decoded);
        film.removeEventListener('error', failed);
        signal.removeEventListener('abort', cancelled);
        error ? reject(error) : resolve();
      };
      const failed = () => finish(new Error('Scene film unavailable'));
      const cancelled = () => finish(new DOMException('Superseded scene', 'AbortError'));
      signal.addEventListener('abort', cancelled, { once: true });
      const phaseGap = () => {
        if (active < 0 || !Number.isFinite(film.duration) || film.duration <= 0) return 0;
        const length = film.duration;
        const difference = Math.abs((films[active].currentTime % length) - film.currentTime);
        return Math.min(difference, length - Math.min(difference, length));
      };
      const frameReady = () => {
        if (settled || aligning || film.seeking || film.readyState < 2) return;
        clearTimeout(frameTimeout);
        if (frame) film.cancelVideoFrameCallback?.(frame);
        frame = 0;
        // A slow keyframe decode can let the outgoing film advance. Correct
        // once more before entering the dissolve, instead of showing two winds.
        if (phaseGap() > .35 && corrections < 1) {
          corrections++;
          waitingFrame = false;
          align();
          return;
        }
        finish();
      };
      const decoded = () => {
        if (settled || !metadataReady || aligning || film.seeking || waitingFrame || film.readyState < 2) return;
        waitingFrame = true;
        if (film.requestVideoFrameCallback) {
          frame = film.requestVideoFrameCallback(frameReady);
          // Some browsers withhold callbacks for an offscreen, paused decoder.
          // This fallback is armed only after seeked, never on the old frame.
          frameTimeout = window.setTimeout(frameReady, 350);
        } else requestAnimationFrame(() => requestAnimationFrame(frameReady));
      };
      const beginDecoding = () => {
        if (allowed()) void film.play().catch(() => {});
        else film.pause();
        decoded();
      };
      const seeked = () => {
        if (!metadataReady || film.seeking || settled) return;
        clearTimeout(seekTimeout);
        if (aligning && seekStarted) seekLead = Math.min(1.5, (performance.now() - seekStarted) / 1000);
        aligning = false;
        beginDecoding();
      };
      const align = () => {
        if (active < 0 || !Number.isFinite(film.duration) || film.duration <= 0 || films[active].readyState < 2) {
          aligning = false;
          beginDecoding();
          return;
        }
        // Seeking itself may take several hundred milliseconds. Once measured,
        // lead by that decode cost so the outgoing clock catches up precisely
        // as the incoming frame arrives. A paused clock always uses zero lead.
        const lead = allowed() && !films[active].paused ? seekLead : 0;
        const target = (films[active].currentTime + lead) % film.duration;
        if (Math.abs(film.currentTime - target) <= .015 && !film.seeking) {
          aligning = false;
          beginDecoding();
          return;
        }
        aligning = true;
        film.pause();
        try {
          seekStarted = performance.now();
          film.currentTime = target;
          // If an unusual decoder fails to dispatch seeked, continue only once
          // it reports that seeking really ended and a current frame exists.
          seekTimeout = window.setTimeout(() => {
            if (!film.seeking && film.readyState >= 2) seeked();
            else finish(new Error('Scene phase seek timed out'));
          }, 8000);
        } catch {
          aligning = false;
          beginDecoding();
        }
      };
      const metadata = () => {
        if (settled || metadataReady || film.readyState < 1) return;
        metadataReady = true;
        align();
      };
      film.addEventListener('loadedmetadata', metadata);
      film.addEventListener('seeked', seeked);
      film.addEventListener('loadeddata', decoded);
      film.addEventListener('canplay', decoded);
      film.addEventListener('error', failed);
      film.muted = true; film.defaultMuted = true; film.loop = true;
      film.playsInline = true; film.poster = scene.poster;
      if (film.dataset.source !== scene.src || film.error) {
        film.dataset.source = scene.src;
        film.src = scene.src;
        film.preload = 'auto';
        film.load();
      }
      metadata();
    });
  }

  function settle(scene: VideoSceneChange, incoming: number) {
    active = incoming;
    current = scene;
    films.forEach((film, index) => {
      film.style.opacity = index === incoming ? '1' : '0';
      film.style.zIndex = index === incoming ? '1' : '0';
      if (index !== incoming) film.pause();
    });
    reference.src = scene.poster;
    fallback.src = scene.poster;
    host.dataset.phase = scene.phase;
    host.dataset.currentSrc = scene.src;
    host.dataset.src = scene.src;
    host.dataset.poster = scene.poster;
    host.dataset.ready = 'true';
    host.dataset.transitioning = 'false';
    emit('video-scene-settled', scene);
    syncPlayback();
  }

  async function pump() {
    if (busy || disposed) return;
    busy = true;
    while (wanted && !disposed) {
      const scene = wanted;
      wanted = undefined;
      // Offscreen and reduced-motion scenes need only their still illustration.
      // Do not download/decode a footer movie while the reader is at the top.
      if (!allowed()) {
        active = -1;
        current = scene;
        films.forEach(film => { film.pause(); film.style.opacity = '0'; });
        reference.src = fallback.src = scene.poster;
        host.dataset.phase = scene.phase;
        host.dataset.currentSrc = host.dataset.src = scene.src;
        host.dataset.poster = scene.poster;
        host.dataset.ready = 'true';
        host.dataset.loading = host.dataset.transitioning = host.dataset.running = 'false';
        emit('video-scene-settled', scene);
        continue;
      }
      if (current?.src === scene.src && active >= 0) {
        settle(scene, active);
        continue;
      }
      const incoming = active === 0 ? 1 : 0;
      const film = films[incoming];
      loadingFilm = film;
      host.dataset.loading = 'true';
      try {
        loadingAbort = new AbortController();
        await waitForFrame(film, scene, loadingAbort.signal);
        loadingAbort = undefined;
        loadingFilm = undefined;
        if (disposed) break;
        if (wanted && wanted.src !== scene.src) { film.pause(); continue; }
        host.dataset.loading = 'false';
        host.dataset.error = 'false';
        delete host.dataset.errorReason;
        emit('video-scene-ready', scene);
        const duration = allowed() ? Math.max(0, Math.min(12_000, scene.duration ?? 2800)) : 0;
        film.style.zIndex = '2';
        film.style.opacity = '0';
        if (active < 0 || duration === 0) {
          settle(scene, incoming);
        } else {
          host.dataset.transitioning = 'true';
          fadingSlot = incoming;
          fadingScene = scene;
          returning = false;
          fadeDuration = duration;
          fade = film.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: 'linear', fill: 'forwards' });
          if (!allowed()) film.pause();
          try { await fade.finished; } catch { /* Disposal cancels the compositor. */ }
          if (disposed) break;
          // Commit the final frame before removing the WAAPI fill layer.
          const keepOutgoing = returning;
          film.style.opacity = keepOutgoing ? '0' : '1';
          fade.cancel(); fade = undefined; fadingSlot = -1;
          fadingScene = undefined;
          if (keepOutgoing && current) settle(current, active);
          else settle(scene, incoming);
        }
      } catch (error) {
        loadingAbort = undefined;
        loadingFilm = undefined;
        film.pause();
        host.dataset.loading = 'false';
        if (disposed || error instanceof DOMException && error.name === 'AbortError') continue;
        host.dataset.error = 'true';
        host.dataset.errorReason = error instanceof Error ? error.message : 'Scene unavailable';
        emit('video-scene-error', scene);
        syncPlayback();
      }
    }
    busy = false;
    host.dataset.targetSrc = wanted?.src || current?.src || host.dataset.src || '';
    if (allowed() && active < 0 && current && host.dataset.error !== 'true') {
      wanted = { ...current, duration: 0 };
      void pump();
    }
  }

  function request(scene: VideoSceneChange) {
    if (!scene?.src || !scene?.poster || disposed) return;
    host.dataset.targetSrc = scene.src;
    if (fade && fadingScene && current) {
      if (scene.src === current.src || scene.src === fadingScene.src) {
        // Reverse the existing dissolve from its exact visual position. Never
        // finish an unwanted scene first or reset opacity on rapid taps.
        wanted = undefined;
        returning = scene.src === current.src;
        fade.updatePlaybackRate(returning ? -1 : 1);
        fade.play();
        return;
      }
      // A third footer scene needs the spare decoder. Complete the current
      // blend gently within 180 ms, then decode only the latest requested scene.
      fade.updatePlaybackRate((returning ? -1 : 1) * Math.max(1, fadeDuration / 180));
      fade.play();
    }
    wanted = scene;
    loadingAbort?.abort();
    void pump();
  }

  host.addEventListener('video-scene-change', event => request((event as CustomEvent<VideoSceneChange>).detail));
  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
    if (allowed() && active < 0 && current) request({ ...current, duration: 0 });
  }, { rootMargin: '30px 0px' });
  view.observe(reference);
  const size = new ResizeObserver(scheduleResize);
  size.observe(reference);
  function refreshPlayback() {
    syncPlayback();
    if (allowed() && active < 0 && current) request({ ...current, duration: 0 });
  }
  const mutation = new MutationObserver(() => { scheduleResize(); refreshPlayback(); });
  mutation.observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-theme', 'data-page-hidden'] });
  // Local phase changes can also alter the footer's dark-mode filter.
  const phaseOwner = host.closest<HTMLElement>('[data-footer-scene]');
  const phaseMutation = new MutationObserver(scheduleResize);
  if (phaseOwner) phaseMutation.observe(phaseOwner, { attributes: true, attributeFilter: ['data-phase'] });
  reduced.addEventListener('change', refreshPlayback);
  document.addEventListener('visibilitychange', refreshPlayback);
  window.addEventListener('resize', scheduleResize, { passive: true });
  reference.addEventListener('load', scheduleResize);
  document.addEventListener('astro:before-swap', () => {
    disposed = true;
    loadingAbort?.abort();
    fade?.cancel();
    if (resizing) cancelAnimationFrame(resizing);
    view.disconnect(); size.disconnect(); mutation.disconnect(); phaseMutation.disconnect();
    reduced.removeEventListener('change', refreshPlayback);
    document.removeEventListener('visibilitychange', refreshPlayback);
    window.removeEventListener('resize', scheduleResize);
    films.forEach(film => { film.pause(); film.removeAttribute('src'); film.load(); });
  }, { once: true });
  resize();
  request({ src: host.dataset.src!, poster: host.dataset.poster!, phase: host.dataset.phase!, duration: 0 });
}
