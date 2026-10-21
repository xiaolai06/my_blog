export type FooterPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type HeroPhase = 'sunset' | 'night';
export type ClockReason = 'initial' | 'boundary' | 'resume' | 'clock-change';
export interface SceneTime { now: Date; hero: HeroPhase; footer: FooterPhase; nextBoundary: number; reason: ClockReason }
type Listener = (time: SceneTime) => void;
const boundaries = [5, 9, 16, 19];
const listeners = new Set<Listener>();
let timer: number | undefined;
let watchdog: number | undefined;
let previousWall = 0;
let previousMonotonic = 0;
let previousTimezoneOffset = 0;
let previousHero: HeroPhase | undefined;
let previousFooter: FooterPhase | undefined;
let running = false;

export function footerPhaseAt(hour: number): FooterPhase {
 return hour >= 5 && hour < 9 ? 'dawn' : hour >= 9 && hour < 16 ? 'day' : hour >= 16 && hour < 19 ? 'dusk' : 'night';
}
export function heroPhaseAt(hour: number): HeroPhase { return hour >= 5 && hour < 19 ? 'sunset' : 'night'; }
export function nextSceneBoundary(now: Date): number {
 for (const hour of boundaries) {
  const candidate = new Date(now); candidate.setHours(hour, 0, 0, 0);
  if (candidate.getTime() > now.getTime()) return candidate.getTime();
 }
 const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(boundaries[0], 0, 0, 0);
 return tomorrow.getTime();
}
export function readSceneTime(reason: ClockReason = 'initial'): SceneTime {
 const now = new Date();
 return { now, hero: heroPhaseAt(now.getHours()), footer: footerPhaseAt(now.getHours()), nextBoundary: nextSceneBoundary(now), reason };
}
function sync(reason: ClockReason) {
 clearTimeout(timer);
 const time = readSceneTime(reason);
 previousTimezoneOffset = time.now.getTimezoneOffset();
 previousHero = time.hero; previousFooter = time.footer;
 document.documentElement.dataset.scenetime = time.footer;
 for (const listener of listeners) listener(time);
 if (!running || !listeners.size) return;
 timer = window.setTimeout(() => sync('boundary'), Math.max(1, time.nextBoundary - Date.now()));
 previousWall = Date.now(); previousMonotonic = performance.now();
}
function onVisibility() { if (!document.hidden) sync('resume'); }
function onPageShow() { if (!running && listeners.size) start(); else if (running) sync('resume'); }
function onPageHide() { stopTimers(); }
function stopTimers() { running = false; clearTimeout(timer); clearInterval(watchdog); }
function start() {
 if (running) return;
 running = true;
 sync('resume');
 // Detect OS clock/timezone changes; boundaries keep their precise timeout.
 watchdog = window.setInterval(() => {
  const wall = Date.now(), monotonic = performance.now();
  const now = new Date();
  const clockChanged = Math.abs((wall - previousWall) - (monotonic - previousMonotonic)) > 1500;
  const timezoneChanged = now.getTimezoneOffset() !== previousTimezoneOffset;
  const phaseChanged = heroPhaseAt(now.getHours()) !== previousHero || footerPhaseAt(now.getHours()) !== previousFooter;
  if (!document.hidden && (clockChanged || timezoneChanged || phaseChanged)) sync('clock-change');
  previousWall = wall; previousMonotonic = monotonic;
 }, 15_000);
}
export function subscribeSceneClock(listener: Listener): () => void {
 const first = listeners.size === 0;
 listeners.add(listener);
 listener(readSceneTime());
 if (first) {
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('pagehide', onPageHide);
  start();
 }
 return () => {
  listeners.delete(listener);
  if (listeners.size) return;
  stopTimers();
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('pageshow', onPageShow);
  window.removeEventListener('pagehide', onPageHide);
 };
}

