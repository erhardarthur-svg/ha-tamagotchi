export const WEATHER_LABELS = Object.freeze({ sunny: 'Ensoleillé', cloudy: 'Nuageux', rainy: 'Pluie', stormy: 'Orage', snowy: 'Neige', foggy: 'Brouillard' });
const HA_CONDITIONS = Object.freeze({
  sunny: 'sunny', 'clear-night': 'sunny', cloudy: 'cloudy', partlycloudy: 'cloudy',
  rainy: 'rainy', pouring: 'rainy', lightning: 'stormy', 'lightning-rainy': 'stormy',
  snowy: 'snowy', 'snowy-rainy': 'snowy', hail: 'snowy', fog: 'foggy',
  windy: 'cloudy', 'windy-variant': 'cloudy', exceptional: 'stormy',
});
export function normalizeWeather(value) {
  if (typeof value !== 'string') return null;
  return Object.prototype.hasOwnProperty.call(WEATHER_LABELS, value) ? value
    : Object.prototype.hasOwnProperty.call(HA_CONDITIONS, value) ? HA_CONDITIONS[value] : null;
}
export function hash(text) {
  let value = 2166136261;
  for (const char of text) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); }
  return value >>> 0;
}
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => { s += 0x6d2b79f5; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
/** Offline ambience: stable for 3 hours, seasonal, never presented as a forecast. */
export function simulatedWeather(time) {
  const winter = [12, 1, 2].includes(time.month), summer = [6, 7, 8].includes(time.month);
  const pool = winter
    ? ['sunny', 'cloudy', 'cloudy', 'rainy', 'rainy', 'snowy', 'foggy', 'sunny']
    : summer
      ? ['sunny', 'sunny', 'sunny', 'cloudy', 'sunny', 'rainy', 'stormy', 'cloudy']
      : ['sunny', 'sunny', 'cloudy', 'cloudy', 'rainy', 'rainy', 'foggy', 'stormy'];
  return pool[hash(`${time.dayKey}/${Math.floor((time.localHour ?? time.hour) / 3)}`) % pool.length];
}
export class VillageWeather {
  constructor() { this.external = null; this.forced = null; }
  force(value) { this.forced = normalizeWeather(value); }
  setExternal(value) { this.external = normalizeWeather(value); }
  read(time) {
    return { kind: this.forced || this.external || simulatedWeather(time), source: this.forced ? 'test' : this.external ? 'ha' : 'simulation' };
  }
}
export const ambienceMessage = ({ period, weather }) => {
  if (weather === 'stormy') return 'L’orage gronde. On se met à l’abri.';
  if (weather === 'rainy') return 'La pluie dessine des ronds sur la place…';
  if (weather === 'snowy') return 'Les flocons se posent doucement sur le village.';
  if (weather === 'foggy') return 'Le village se devine à travers la brume…';
  return { morning: 'Le village s’éveille…', day: 'La vie suit son cours, au bord de l’eau.', evening: 'Le soir descend. Les lanternes s’allument.', night: 'La nuit est calme. Le village se repose.' }[period];
};
/** Bounded deterministic particle pool. Rendering and simulation are separate. */
export class WeatherEffects {
  constructor(width, height, random = seededRandom(402)) {
    this.width = width; this.height = height; this.kind = 'sunny'; this.random = random;
    this.age = 0; this.flash = 0; this.nextFlash = 16;
    this.particles = Array.from({ length: 135 }, () => ({ x: random() * width, y: random() * height, depth: .35 + random() * .65, phase: random() * Math.PI * 2 }));
    this.mist = Array.from({ length: 7 }, (_, i) => ({ x: random() * width, y: 100 + i * height / 7, radius: 170 + random() * 190 }));
  }
  setWeather(kind) { if (this.kind !== kind) { this.kind = kind; this.flash = 0; this.nextFlash = this.age + 12 + this.random() * 14; } }
  update(dt, reducedMotion = false) {
    if (reducedMotion) { this.flash = 0; return; }
    this.age += dt; this.flash = Math.max(0, this.flash - dt * 1.7);
    if (this.kind === 'stormy' && this.age >= this.nextFlash) { this.flash = .2; this.nextFlash = this.age + 18 + this.random() * 24; }
    const snow = this.kind === 'snowy';
    if (!snow && this.kind !== 'rainy' && this.kind !== 'stormy') return;
    for (const p of this.particles) {
      p.y = (p.y + dt * (snow ? 28 : 470) * p.depth) % this.height;
      p.x = (p.x + dt * (snow ? Math.sin(this.age * .4 + p.phase) * 13 + 7 : -100) * p.depth + this.width) % this.width;
    }
  }
  draw(ctx, reducedMotion = false) {
    const { width: w, height: h, kind, age } = this;
    ctx.save();
    if (kind === 'rainy' || kind === 'stormy') {
      ctx.strokeStyle = kind === 'stormy' ? '#c2d7e769' : '#d2e6e957'; ctx.lineWidth = 1.2; ctx.beginPath();
      const count = kind === 'stormy' ? 135 : 85;
      for (let i = 0; i < count; i++) {
        const p = this.particles[i], length = (9 + p.depth * 15) * (reducedMotion ? .4 : 1);
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - length * .23, p.y + length);
      }
      ctx.stroke();
      for (let i = 0; i < 16; i++) {
        const phase = ((reducedMotion ? .6 : age * .85) + i * .371) % 1;
        const x = 515 + (i * 61 % 430), y = 355 + (i * 47 % 210);
        if (Math.hypot(x - 710, y - 442) < 80) continue;
        ctx.strokeStyle = `rgba(205,224,228,${(1 - phase) * .35})`;
        ctx.beginPath(); ctx.ellipse(x, y, 2 + phase * 7, 1 + phase * 3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    if (kind === 'snowy') {
      for (let i = 0; i < 90; i++) { const p = this.particles[i]; ctx.fillStyle = `rgba(244,249,243,${.35 + p.depth * .6})`; const size = 1 + p.depth * 3; ctx.fillRect(Math.round(p.x), Math.round(p.y), size, size); }
    }
    if (kind === 'foggy') {
      ctx.fillStyle = '#d6e1d914'; ctx.fillRect(0, 0, w, h);
      for (const layer of this.mist) {
        const x = ((layer.x + age * 7) % (w + 700)) - 350;
        const g = ctx.createRadialGradient(x, layer.y, 0, x, layer.y, layer.radius);
        g.addColorStop(0, '#e3e9de30'); g.addColorStop(1, '#e3e9de00');
        ctx.fillStyle = g; ctx.fillRect(x - layer.radius, layer.y - layer.radius, layer.radius * 2, layer.radius * 2);
      }
    }
    if (this.flash > 0 && !reducedMotion) {
      ctx.fillStyle = `rgba(224,237,251,${this.flash})`; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(232,240,248,${this.flash * 1.8})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(1310, 0); ctx.lineTo(1290, 35); ctx.lineTo(1306, 32); ctx.lineTo(1277, 74); ctx.stroke();
    }
    ctx.restore();
  }
}
