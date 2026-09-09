import { VillageClock } from './time.js?v=4.5';
import { VillageWeather } from './weather.js?v=4.5';
import { VillageScene } from './scene.js?v=4.5';
import { VillageUI } from './ui.js?v=4.5';
import { installBridge } from './bridge.js?v=4.5';
import { APPOINTMENTS } from './events.js?v=4.5';

const clock = new VillageClock(), weather = new VillageWeather();
let scene, lastUI = 0, externalWeatherAt = null, previewEvent = null;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
if (window.parent !== window || new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embedded');

function refresh() {
  // A disconnected integration must not leave an old weather state displayed forever.
  if (externalWeatherAt !== null && Date.now() - externalWeatherAt > 30 * 60 * 1000) {
    weather.setExternal(null); externalWeatherAt = null;
  }
  if (previewEvent && !scene?.life.scheduled) { previewEvent = null; clock.force(null); }
  const time = clock.read();
  if (previewEvent) Object.assign(time, { hour: previewEvent.hour, minute: previewEvent.minute, clock: `${String(previewEvent.hour).padStart(2, '0')}:${String(previewEvent.minute).padStart(2, '0')}`, forced: true });
  const conditions = weather.read(time);
  scene?.setEnvironment({ period: time.period, weather: conditions.kind }, false, reducedMotion);
  scene?.setClock(time);
  ui.update(time, conditions, scene?.life, clock.forcedPeriod, weather.forced);
}
const ui = new VillageUI({
  onPeriod: period => { previewEvent = null; scene?.life.endAppointment(); clock.force(period); refresh(); },
  onWeather: kind => { weather.force(kind); refresh(); },
  onHour: hour => { previewEvent = null; scene?.life.endAppointment(); clock.forceTime(hour); refresh(); },
  onMoment: kind => {
    if (!scene) return;
    previewEvent = null; scene.life.endAppointment(); clock.forceTime(10); weather.force('sunny'); refresh();
    scene.life.triggerMoment(kind); refresh();
  },
  onAuto: () => { previewEvent = null; scene?.life.endAppointment(); clock.force(null); weather.force(null); refresh(); },
  onEvent: id => {
    const event = APPOINTMENTS.find(e => e.id === id);
    if (!scene || !event) return;
    previewEvent = event; clock.force(event.id === 'night' ? 'night' : 'day');
    scene.life.startAppointment(event); refresh();
  },
});
const removeBridge = installBridge(state => {
  clock.setExternal(state);
  if ('weather' in state) { weather.setExternal(state.weather); externalWeatherAt = Date.now(); }
  refresh();
}, () => {
  previewEvent = null; scene?.life.endAppointment(); clock.resetExternal(); clock.force(null); weather.setExternal(null); weather.force(null); externalWeatherAt = null; refresh();
});
refresh();

async function start() {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve; image.onerror = () => reject(new Error('Décor introuvable.'));
    image.src = new URL('./assets/village-center.webp', import.meta.url).href;
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
  const inputEvents = new AbortController();
  const focusClock = focused => {
    scene.camera.setFocused(focused, reducedMotion);
    ui.hint(focused ? 'Un autre toucher pour retrouver tout le village.' : 'La vie reprend autour du clocher…');
    scene.draw(reducedMotion); refresh();
  };
  let keyboardResident = 0;
  canvas.addEventListener('click', event => {
    if (event.detail === 0) return;
    const box = canvas.getBoundingClientRect();
    const { x, y } = scene.camera.worldPoint((event.clientX - box.left) * canvas.width / box.width, (event.clientY - box.top) * canvas.height / box.height);
    if (scene.camera.focused || scene.camera.hitsClock(x, y)) { focusClock(!scene.camera.focused); return; }
    const visible = scene.life.residents.filter(v => !v.hidden);
    const nearest = visible.sort((a, b) => Math.hypot(a.x - x, a.y - 12 - y) - Math.hypot(b.x - x, b.y - 12 - y))[0];
    if (nearest && Math.hypot(nearest.x - x, nearest.y - 12 - y) < Math.max(30, 18 * canvas.width / box.width / scene.camera.scale)) { scene.life.greet(nearest); refresh(); }
  }, { signal: inputEvents.signal });
  canvas.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'h' || (event.key === 'Escape' && scene.camera.focused)) {
      event.preventDefault(); focusClock(event.key === 'Escape' ? false : !scene.camera.focused); return;
    }
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    const visible = scene.life.residents.filter(v => !v.hidden);
    scene.life.greet(visible[keyboardResident++ % visible.length]); refresh();
  }, { signal: inputEvents.signal });

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
    disposed = true; cancelAnimationFrame(frameId); inputEvents.abort(); removeBridge(); resizeObserver?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('resize', resize);
    if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', motionChange);
    else motionPreference.removeListener(motionChange);
  });
  window.addEventListener('pageshow', syncPlayback);
  syncPlayback();
}
start().catch(error => { console.error('[ha-village]', error); ui.error(); });
