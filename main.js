import { VillageClock } from './time.js';
import { VillageWeather } from './weather.js';
import { VillageScene } from './scene.js';
import { VillageUI } from './ui.js';
import { installBridge } from './bridge.js';

const clock = new VillageClock(), weather = new VillageWeather();
let scene, lastUI = 0, externalWeatherAt = null;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
if (window.parent !== window || new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embedded');

function refresh() {
  // A disconnected integration must not leave an old weather state displayed forever.
  if (externalWeatherAt !== null && Date.now() - externalWeatherAt > 30 * 60 * 1000) {
    weather.setExternal(null); externalWeatherAt = null;
  }
  const time = clock.read(), conditions = weather.read(time);
  scene?.setEnvironment({ period: time.period, weather: conditions.kind }, false, reducedMotion);
  ui.update(time, conditions, scene?.life, clock.forcedPeriod, weather.forced);
}
const ui = new VillageUI({
  onPeriod: period => { clock.force(period); refresh(); },
  onWeather: kind => { weather.force(kind); refresh(); },
  onAuto: () => { clock.force(null); weather.force(null); refresh(); },
});
const removeBridge = installBridge(state => {
  clock.setExternal(state);
  if ('weather' in state) { weather.setExternal(state.weather); externalWeatherAt = Date.now(); }
  refresh();
}, () => {
  clock.resetExternal(); clock.force(null); weather.setExternal(null); weather.force(null); externalWeatherAt = null; refresh();
});
refresh();

async function start() {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve; image.onerror = () => reject(new Error('Décor introuvable.'));
    image.src = new URL('./assets/village.webp', import.meta.url).href;
  });
  const canvas = document.getElementById('village');
  scene = new VillageScene(canvas, image);
  const time = clock.read();
  scene.setEnvironment({ period: time.period, weather: weather.read(time).kind }, true, reducedMotion);
  const resize = () => {
    const bounds = canvas.parentElement.getBoundingClientRect();
    scene.resize(bounds.width, bounds.height, window.devicePixelRatio || 1); scene.draw(reducedMotion);
  };
  let resizeObserver;
  if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas.parentElement); }
  else window.addEventListener('resize', resize);
  resize(); refresh(); ui.ready();

  let frameId = 0, lastFrame = 0, onscreen = true, disposed = false;
  const frameInterval = () => reducedMotion ? 1000 : 1000 / 30;
  function frame(timestamp) {
    frameId = 0;
    if (disposed || document.hidden || !onscreen) return;
    const elapsed = timestamp - lastFrame;
    if (elapsed >= frameInterval() - .5) {
      // Pausing a tab never produces a giant simulation step when it becomes visible.
      const dt = Math.min(elapsed / 1000, .08);
      lastFrame = timestamp - elapsed % frameInterval();
      scene.update(dt, reducedMotion); scene.draw(reducedMotion);
      if (timestamp - lastUI > 1000) { refresh(); lastUI = timestamp; }
    }
    frameId = requestAnimationFrame(frame);
  }
  function syncPlayback() {
    cancelAnimationFrame(frameId); frameId = 0;
    if (!disposed && !document.hidden && onscreen) { lastFrame = performance.now(); refresh(); frameId = requestAnimationFrame(frame); }
  }
  document.addEventListener('visibilitychange', syncPlayback);
  let intersection;
  if ('IntersectionObserver' in window) {
    intersection = new IntersectionObserver(entries => { onscreen = entries[0].isIntersecting; syncPlayback(); });
    intersection.observe(canvas);
  }
  const motionChange = event => { reducedMotion = event.matches; scene.effects.flash = 0; syncPlayback(); };
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', motionChange);
  else motionPreference.addListener(motionChange);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { cancelAnimationFrame(frameId); return; }
    disposed = true; cancelAnimationFrame(frameId); removeBridge(); resizeObserver?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('resize', resize);
    if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', motionChange);
    else motionPreference.removeListener(motionChange);
  });
  window.addEventListener('pageshow', syncPlayback);
  syncPlayback();
}
start().catch(error => { console.error('[ha-village]', error); ui.error(); });
