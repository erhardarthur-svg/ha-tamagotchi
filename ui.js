import { PERIODS } from './time.js?v=4.5';
import { WEATHER_LABELS, ambienceMessage } from './weather.js?v=4.5';

export class VillageUI {
  constructor({ onPeriod, onWeather, onAuto, onEvent, onHour, onMoment }, root = document) {
    this.root = root; this.last = {}; this.debug = new URLSearchParams(location.search).get('debug') === '1';
    this.nodes = Object.fromEntries(['sceneDescription', 'eventText', 'debugToggle', 'debugPanel', 'debugClose', 'autoBtn', 'bootMessage'].map(id => [id, root.getElementById(id)]));
    if (!this.debug) return;
    root.body.classList.add('debug-enabled'); this.nodes.debugToggle.hidden = false;
    const toggle = open => {
      this.nodes.debugPanel.hidden = !open; this.nodes.debugToggle.setAttribute('aria-expanded', String(open));
      (open ? this.nodes.debugClose : this.nodes.debugToggle).focus();
    };
    this.nodes.debugToggle.addEventListener('click', () => toggle(this.nodes.debugPanel.hidden));
    this.nodes.debugClose.addEventListener('click', () => toggle(false));
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && !this.nodes.debugPanel.hidden) toggle(false); });
    root.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => onPeriod(button.dataset.period)));
    root.querySelectorAll('[data-weather]').forEach(button => button.addEventListener('click', () => onWeather(button.dataset.weather)));
    this.nodes.autoBtn.addEventListener('click', onAuto);
    root.querySelectorAll('[data-event]').forEach(button => button.addEventListener('click', () => onEvent(button.dataset.event)));
    root.querySelectorAll('[data-hour]').forEach(button => button.addEventListener('click', () => onHour(Number(button.dataset.hour))));
    root.querySelectorAll('[data-moment]').forEach(button => button.addEventListener('click', () => onMoment(button.dataset.moment)));
  }
  text(id, value) { if (this.last[id] !== value) { this.nodes[id].textContent = value; this.last[id] = value; } }
  hint(text) { this.hintText = text; this.hintUntil = Date.now() + 5000; }
  update(time, weather, life, forcedPeriod, forcedWeather) {
    const label = weather.kind === 'sunny' && time.period === 'night' ? 'Ciel dégagé' : WEATHER_LABELS[weather.kind];
    const source = { simulation: 'Météo simulée.', test: 'Météo de test.', ha: 'Météo Home Assistant.' }[weather.source];
    // Accessible text only: the visible weather badge and clock overlay are gone.
    this.text('sceneDescription', `${time.clock}, ${time.shortDate}. ${PERIODS[time.period]}. ${label}. ${source}`);
    // Weather is expressed visually, including in normal mode's ambient message.
    this.text('eventText', (Date.now() < this.hintUntil && this.hintText) || life?.event?.text || (time.hour >= 12 && time.hour < 14 ? 'À la taverne, les services du déjeuner se succèdent…' : ambienceMessage({ period: time.period, weather: 'sunny' })));
    if (this.debug) {
      this.root.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === forcedPeriod)));
      this.root.querySelectorAll('[data-weather]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weather === forcedWeather)));
      this.nodes.autoBtn.setAttribute('aria-pressed', String(!forcedPeriod && !forcedWeather));
    }
  }
  ready() { this.nodes.bootMessage.hidden = true; }
  error() { this.nodes.bootMessage.textContent = 'Le village n’a pas pu démarrer. Recharge la page.'; this.nodes.bootMessage.hidden = false; }
}
