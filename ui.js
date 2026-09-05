import { PERIODS } from './time.js';
import { WEATHER_LABELS, ambienceMessage } from './weather.js';

// Small functional state icons, never part of the village illustration.
const ICONS = {
  morning: '<path d="M3 17h18M5 21h14M7 17a5 5 0 0 1 10 0M12 3v4M4 10l2 2m14-2-2 2M12 11V7m-2 2 2-2 2 2"/>',
  day: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  evening: '<path d="M3 17h18M5 21h14M7 17a5 5 0 0 1 10 0M4 10l2 2m14-2-2 2M12 3v5m-2-2 2 2 2-2"/>',
  night: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/><path d="M17 3v4m-2-2h4m2 4v2m-1-1h2"/>',
};
export class VillageUI {
  constructor({ onPeriod, onWeather, onAuto }, root = document) {
    this.root = root; this.last = {}; this.debug = new URLSearchParams(location.search).get('debug') === '1';
    this.nodes = Object.fromEntries(['clock', 'dateLabel', 'periodLabel', 'weatherLabel', 'weatherSource', 'periodIcon', 'eventText', 'debugToggle', 'debugPanel', 'debugClose', 'autoBtn', 'bootMessage'].map(id => [id, root.getElementById(id)]));
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
  }
  text(id, value) { if (this.last[id] !== value) { this.nodes[id].textContent = value; this.last[id] = value; } }
  update(time, weather, life, forcedPeriod, forcedWeather) {
    this.text('clock', time.clock); this.nodes.clock.dateTime = time.date.toISOString();
    this.text('dateLabel', time.shortDate); this.text('periodLabel', PERIODS[time.period]);
    const label = weather.kind === 'sunny' && time.period === 'night' ? 'Ciel dégagé' : WEATHER_LABELS[weather.kind];
    this.text('weatherLabel', label);
    const sourceLabel = { simulation: 'simulée', test: 'test', ha: '' }[weather.source];
    this.text('weatherSource', sourceLabel); this.nodes.weatherSource.hidden = !sourceLabel;
    if (this.last.icon !== time.period) { this.nodes.periodIcon.innerHTML = ICONS[time.period]; this.last.icon = time.period; }
    this.text('eventText', life?.event?.text || ambienceMessage({ period: time.period, weather: weather.kind }));
    if (this.debug) {
      this.root.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === forcedPeriod)));
      this.root.querySelectorAll('[data-weather]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weather === forcedWeather)));
      this.nodes.autoBtn.setAttribute('aria-pressed', String(!forcedPeriod && !forcedWeather));
    }
  }
  ready() { this.nodes.bootMessage.hidden = true; }
  error() { this.nodes.bootMessage.textContent = 'Le village n’a pas pu démarrer. Recharge la page.'; this.nodes.bootMessage.hidden = false; }
}
