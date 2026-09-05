import { normalizeWeather } from './weather.js';
import { validDate, validTimezone } from './time.js';

/** Only these plain values cross the HA boundary. No token or entity ID is needed here. */
export function sanitizeState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const state = {};
  if ('datetime' in value && validDate(value.datetime)) state.datetime = new Date(value.datetime).toISOString();
  if (validTimezone(value.timeZone)) state.timeZone = value.timeZone;
  if ('weather' in value) {
    const weather = normalizeWeather(value.weather);
    if (weather || value.weather === null || value.weather === 'unavailable' || value.weather === 'unknown') state.weather = weather;
  }
  return Object.keys(state).length ? state : null;
}

/** Cross-origin messages are opt-in and accepted only from the actual parent frame. */
export function acceptsMessage(event, currentWindow, allowedOrigin) {
  return currentWindow.parent !== currentWindow && event.source === currentWindow.parent
    && Boolean(allowedOrigin) && allowedOrigin !== 'null' && event.origin === allowedOrigin
    && event.data?.type === 'ha-village:state';
}

export function installBridge(onState, onReset, currentWindow = window) {
  const parameters = new URLSearchParams(currentWindow.location.search);
  // Same-origin embedding works immediately. Cross-origin HA must explicitly opt in.
  let allowedOrigin = currentWindow.location.origin;
  const requestedOrigin = parameters.get('ha_origin');
  if (requestedOrigin) {
    try {
      const url = new URL(requestedOrigin);
      allowedOrigin = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.origin : null;
    } catch { allowedOrigin = null; }
  }
  const apply = value => {
    const state = sanitizeState(value);
    if (!state) return false;
    onState(state); return true;
  };
  const onMessage = event => { if (acceptsMessage(event, currentWindow, allowedOrigin)) apply(event.data.state); };
  currentWindow.addEventListener('message', onMessage);
  const api = Object.freeze({ version: '4.0.0', setState: apply, reset: onReset });
  currentWindow.haVillage = api;
  currentWindow.dispatchEvent(new CustomEvent('ha-village:ready', { detail: { version: api.version } }));
  return () => { currentWindow.removeEventListener('message', onMessage); if (currentWindow.haVillage === api) delete currentWindow.haVillage; };
}
