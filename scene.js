import { WORLD, FOUNTAIN, CHIMNEYS, LANTERNS, WINDOWS } from './world.js';
import { WeatherEffects, seededRandom } from './weather.js';
import { VillageLife } from './entities.js';

const DARKNESS = { morning: .03, day: 0, evening: .3, night: .85 };
const RIVER_GLINTS = [[1242, 34], [1270, 69], [1300, 99], [1363, 262], [1414, 316], [1300, 358], [1300, 540], [1349, 576], [1390, 609], [1290, 650], [1377, 720], [1431, 800], [1368, 935], [1360, 988]];
const browserSurface = (width, height) => {
  const surface = document.createElement('canvas'); surface.width = width; surface.height = height; return surface;
};

/** Pure canvas renderer with injected surfaces so the same scene can run in tests. */
export class VillageScene {
  constructor(canvas, image, { createSurface = browserSurface, random = seededRandom(4105) } = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D indisponible.');
    this.image = image; this.makeSurface = createSurface; this.age = 0;
    this.environment = { period: 'day', weather: 'sunny' };
    this.light = 0; this.previousLight = 0; this.targetLight = 0; this.transition = 1;
    this.current = createSurface(WORLD.width, WORLD.height);
    this.previous = createSurface(WORLD.width, WORLD.height);
    this.life = new VillageLife(random); this.effects = new WeatherEffects(WORLD.width, WORLD.height);
    this.fireflies = Array.from({ length: 10 }, () => ({ x: 1010 + random() * 180, y: 650 + random() * 210, phase: random() * 7 }));
    this.setEnvironment(this.environment, true);
    this.resize(canvas.width, canvas.height, 1);
  }
  resize(width, height, requestedDpr = 1) {
    if (width <= 0 || height <= 0) return;
    // An upper pixel budget matters more than high DPR for this pixel-art scene.
    const dpr = Math.max(.5, Math.min(requestedDpr, 1.5, Math.sqrt(1800000 / (width * height))));
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    const w = this.canvas.width, h = this.canvas.height;
    this.scale = Math.max(w / WORLD.width, h / WORLD.height);
    this.offsetX = (w - WORLD.width * this.scale) / 2;
    this.offsetY = (h - WORLD.height * this.scale) / 2;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }
  setEnvironment(environment, initial = false, reducedMotion = false) {
    if (!initial && environment.period === this.environment.period && environment.weather === this.environment.weather) return;
    if (!initial) {
      const ctx = this.previous.getContext('2d');
      if (this.transition < 1) {
        // Preserve the actual intermediate image when the debug buttons change quickly.
        ctx.globalAlpha = this.transition; ctx.drawImage(this.current, 0, 0); ctx.globalAlpha = 1;
      } else ctx.drawImage(this.current, 0, 0);
    }
    this.environment = { ...environment };
    this.previousLight = this.light; this.targetLight = DARKNESS[environment.period];
    this.transition = initial || reducedMotion ? 1 : 0;
    if (initial || reducedMotion) this.light = this.targetLight;
    this.paintTerrain(this.current.getContext('2d'), environment);
    this.life.setEnvironment(environment, initial); this.effects.setWeather(environment.weather);
  }
  paintTerrain(ctx, { period, weather }) {
    const { width: w, height: h } = WORLD;
    ctx.save(); ctx.clearRect(0, 0, w, h);
    const filter = { sunny: 'none', cloudy: 'saturate(.67) contrast(.88) brightness(.94)', rainy: 'saturate(.62) brightness(.8)', stormy: 'saturate(.48) brightness(.66)', snowy: 'saturate(.58) brightness(1.12)', foggy: 'saturate(.65) contrast(.8)' };
    ctx.filter = filter[weather]; ctx.drawImage(this.image, 0, 0, w, h); ctx.filter = 'none';
    if (period !== 'day') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = { morning: '#f5e9ce', evening: '#c7a99d', night: '#52718f' }[period];
      ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
      if (period === 'night') { ctx.fillStyle = '#101e3d70'; ctx.fillRect(0, 0, w, h); }
      else {
        const gradient = ctx.createLinearGradient(0, 0, w, h * .55);
        gradient.addColorStop(0, period === 'evening' ? '#ffae5649' : '#ffe8ba24');
        gradient.addColorStop(1, period === 'evening' ? '#4d385426' : '#d9efe300');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
      }
    }
    if (weather === 'rainy' || weather === 'stormy') {
      ctx.fillStyle = '#9eb7c31c'; ctx.beginPath();
      ctx.moveTo(493, 342); ctx.lineTo(944, 323); ctx.lineTo(963, 539); ctx.lineTo(874, 582); ctx.lineTo(589, 569); ctx.closePath(); ctx.fill();
    }
    if (weather === 'snowy') {
      ctx.fillStyle = period === 'night' ? '#acbfd619' : '#e8f0e624'; ctx.fillRect(0, 0, w, h);
      const rng = seededRandom(204);
      for (let i = 0; i < 700; i++) {
        const x = rng() * 1150, y = rng() * h;
        ctx.fillStyle = period === 'night' ? '#c4d3e027' : '#eff4e951';
        ctx.fillRect(x, y, 2 + rng() * 5, 1 + rng() * 2);
      }
    }
    // A restrained edge shade keeps the village readable behind the overlay.
    const vignette = ctx.createRadialGradient(w * .48, h * .45, h * .25, w * .48, h * .45, w * .66);
    vignette.addColorStop(0, '#0d211b00'); vignette.addColorStop(1, period === 'night' ? '#07112552' : '#14251627');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  update(dt, reducedMotion = false) {
    this.transition = Math.min(1, this.transition + dt / 1.4);
    const ease = this.transition * this.transition * (3 - 2 * this.transition);
    this.light = this.previousLight + (this.targetLight - this.previousLight) * ease;
    if (!reducedMotion) { this.age += dt; this.life.update(dt); }
    this.effects.update(dt, reducedMotion);
  }
  draw(reducedMotion = false) {
    const ctx = this.ctx, { width: w, height: h } = WORLD;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#263b2a'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
    if (this.transition < 1) {
      ctx.drawImage(this.previous, 0, 0); ctx.globalAlpha = this.transition; ctx.drawImage(this.current, 0, 0); ctx.globalAlpha = 1;
    } else ctx.drawImage(this.current, 0, 0);
    this.drawWater(ctx);
    this.drawLighting(ctx);
    this.life.draw(ctx, this.light);
    this.drawSmoke(ctx);
    if (this.environment.period === 'evening' || this.environment.period === 'night') this.drawFireflies(ctx);
    this.effects.draw(ctx, reducedMotion);
    // Preserve a consistent context for clients that reuse the canvas.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  drawWater(ctx) {
    ctx.save(); ctx.globalAlpha = 1 - this.light * .7;
    for (let i = 0; i < RIVER_GLINTS.length; i++) {
      const [x, y] = RIVER_GLINTS[i], p = (this.age * .28 + i * .27) % 1;
      ctx.strokeStyle = `rgba(197,234,211,${Math.sin(p * Math.PI) * .4})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + Math.sin(i) * p * 7, y + p * 13); ctx.lineTo(x + 8 + Math.sin(i) * p * 7, y + p * 13); ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const p = (this.age * .38 + i / 3) % 1;
      ctx.strokeStyle = `rgba(205,235,220,${(1 - p) * .43})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(FOUNTAIN.x, FOUNTAIN.y, 5 + p * 33, 3 + p * 25, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Foam and short vertical streaks sit within the original upper cascade.
    for (let i = 0; i < 11; i++) {
      const p = (this.age * .6 + i * .317) % 1, x = 1332 + i * 5;
      ctx.fillStyle = `rgba(220,245,233,${(1 - p) * .28})`;
      ctx.fillRect(x, 177 + p * 36, 1.5, 4 + i % 3);
    }
    ctx.restore();
  }
  drawLighting(ctx) {
    if (this.light < .05) return;
    ctx.save(); ctx.globalAlpha = Math.min(1, this.light * 2.5);
    for (const lamp of LANTERNS) {
      const flicker = .94 + Math.sin(this.age * 1.6 + lamp.x) * .025;
      const glow = ctx.createRadialGradient(lamp.x, lamp.ground, 0, lamp.x, lamp.ground, 78);
      glow.addColorStop(0, `rgba(255,197,96,${.24 * flicker})`); glow.addColorStop(.4, '#f5ba6520'); glow.addColorStop(1, '#efaf5000');
      ctx.fillStyle = glow; ctx.fillRect(lamp.x - 78, lamp.ground - 78, 156, 156);
      ctx.fillStyle = '#e5b462'; ctx.fillRect(lamp.x - 2, lamp.y - 2, 4, 7);
      ctx.fillStyle = '#fff2bc'; ctx.fillRect(lamp.x - 1, lamp.y - 1, 2, 4);
    }
    for (let i = 0; i < WINDOWS.length; i++) {
      const window = WINDOWS[i];
      if (this.environment.period === 'night' && [2, 7, 10].includes(i)) continue;
      const glow = ctx.createRadialGradient(window.x, window.y, 0, window.x, window.y, 35);
      glow.addColorStop(0, '#f7c3724a'); glow.addColorStop(1, '#f7c37200'); ctx.fillStyle = glow;
      ctx.fillRect(window.x - 35, window.y - 35, 70, 70);
      ctx.fillStyle = i % 3 ? '#eabc70' : '#e2ac5d'; ctx.fillRect(window.x - window.w / 2, window.y, window.w, window.h);
      ctx.fillStyle = '#66533b'; ctx.fillRect(window.x - 1, window.y, 2, window.h); ctx.fillRect(window.x - window.w / 2, window.y + 4, window.w, 1);
    }
    ctx.restore();
  }
  drawSmoke(ctx) {
    const windy = this.environment.weather === 'rainy' || this.environment.weather === 'stormy';
    ctx.save();
    CHIMNEYS.forEach(([x, y], index) => {
      if (this.environment.period === 'day' && index % 2 === 1) return;
      for (let i = 0; i < 7; i++) {
        const p = (this.age * .115 + i / 7 + index * .2) % 1;
        const alpha = Math.sin(p * Math.PI) * (1 - p) * .22 * (1 - this.light * .4);
        ctx.fillStyle = `rgba(217,219,204,${alpha})`;
        const xx = x + p * (windy ? -65 : 19) + Math.sin(p * 7 + index) * p * 9;
        ctx.beginPath(); ctx.ellipse(xx, y - p * 72, 3 + p * 14, 4 + p * 9, .25, 0, Math.PI * 2); ctx.fill();
      }
    }); ctx.restore();
  }
  drawFireflies(ctx) {
    if (['rainy', 'stormy', 'snowy'].includes(this.environment.weather)) return;
    ctx.save();
    for (const fly of this.fireflies) {
      const a = Math.max(0, Math.sin(this.age * .6 + fly.phase)) * .52;
      const x = fly.x + Math.sin(this.age * .17 + fly.phase) * 12, y = fly.y + Math.cos(this.age * .22 + fly.phase) * 6;
      ctx.fillStyle = `rgba(226,230,134,${a})`; ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  }
}
