import { MARKET_STALLS } from './world.js?v=4.6';

const pixel = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const GARLAND = [[555, 487], [875, 488]];
const ACCENTS = [[175, 392], [236, 409], [1111, 580], [1079, 663], [565, 815], [532, 938], [261, 953], [1020, 926]];

/** Small code-native game props and bounded particles; the original terrain stays cached. */
export function drawCalendarGround(ctx, calendar, life, time, age, light) {
  if (!calendar) return;
  ctx.save();
  const badWeather = ['rainy', 'stormy'].includes(life.weather);
  const event = life.happening;
  if (!badWeather && (calendar.market || event?.kind === 'market')) {
    for (const stall of MARKET_STALLS) drawStall(ctx, stall.x, stall.y, stall.color, light);
  }
  const decor = calendar.festival?.decor;
  if (decor) {
    ctx.globalAlpha = 1 - light * .45;
    drawGarland(ctx, decor, age);
    if (decor === 'winter') drawTree(ctx, 1082, 616, light, age);
    if (decor === 'pumpkins' || decor === 'harvest') {
      for (const [x, y] of [[561, 509], [873, 550], [428, 689], [399, 333]]) drawPumpkin(ctx, x, y, decor === 'pumpkins' ? light : 0);
    }
    if (decor === 'flowers' || decor === 'hearts') {
      for (const [x, y] of [[558, 503], [872, 541], [400, 330]]) {
        pixel(ctx, x - 8, y - 8, 16, 10, '#846347');
        for (let i = 0; i < 6; i++) { pixel(ctx, x - 8 + i * 3, y - 12, 3, 5, i % 2 ? '#e7bf99' : '#c77e8d'); }
      }
    }
  }
  if (event?.kind === 'picnic') {
    pixel(ctx, 494, 490, 36, 17, '#c39277');
    for (let i = 0; i < 5; i++) pixel(ctx, 494 + i * 8, 490, 3, 17, '#eedcba');
    pixel(ctx, 494, 496, 36, 3, '#eedcba');
    pixel(ctx, 507, 487, 12, 9, '#ac8047'); pixel(ctx, 507, 487, 12, 2, '#d9b670');
  }
  // Seasonal ground details stay off the roads, buildings and the water.
  if (calendar.season === 'spring' || calendar.season === 'autumn') {
    const palette = calendar.season === 'spring' ? ['#e4b7b0', '#edd4b7', '#f0e5ce'] : ['#b98749', '#c29e51', '#b27346'];
    ctx.globalAlpha = .7 - light * .35;
    for (const [x, y] of ACCENTS) for (let i = 0; i < 12; i++) {
      pixel(ctx, x + Math.sin(i * 5.7) * 22, y + Math.cos(i * 2.3) * 12, 4, 2, palette[i % 3]);
    }
  }
  ctx.restore();
}

export function drawCalendarAir(ctx, calendar, life, time, age, reducedMotion = false) {
  if (!calendar || reducedMotion) return;
  const night = life.period === 'night', badWeather = ['rainy', 'stormy', 'snowy'].includes(life.weather);
  ctx.save();
  if (!night && !badWeather) {
    if (['spring', 'autumn'].includes(calendar.season)) {
      for (let i = 0; i < 8; i++) {
        const p = (age * .022 + i * .127) % 1, [ax, ay] = ACCENTS[i];
        ctx.globalAlpha = Math.sin(p * Math.PI) * .72;
        pixel(ctx, ax + Math.sin(p * 6 + i) * 30, ay - 70 + p * 80, 4, 3, calendar.season === 'spring' ? '#ebc5c3' : '#ce9b52');
      }
    }
    if (['spring', 'summer'].includes(calendar.season)) {
      ctx.globalAlpha = .85;
      for (let i = 0; i < 4; i++) {
        const x = 540 + Math.sin(age * .19 + i * 2) * 45, y = 862 + Math.cos(age * .24 + i) * 28;
        const wing = Math.sin(age * 11 + i) > 0 ? 4 : 1;
        pixel(ctx, x - wing, y, wing * 2 + 1, 3, i % 2 ? '#d6ae61' : '#e8d5a2'); pixel(ctx, x, y, 1, 4, '#635740');
      }
    }
  }
  ctx.globalAlpha = 1;
  const event = life.happening;
  if (event) {
    const elapsed = life.age - event.started;
    if (['games', 'snowball'].includes(event.kind)) {
      const players = event.residents.slice(0, 2).map(id => life.residents[id]);
      if (players.length === 2 && players.every(v => !v.route.length && v.activity === 'play')) {
        const t = elapsed % 3 / 3, reverse = Math.floor(elapsed / 3) % 2;
        const [a, b] = reverse ? [players[1], players[0]] : players;
        const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t - 10 - Math.sin(t * Math.PI) * 33;
        ctx.fillStyle = '#17292133'; ctx.beginPath(); ctx.ellipse(x, y + 15, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
        pixel(ctx, x - 4, y - 4, 8, 8, event.kind === 'snowball' ? '#f0f0df' : '#b6744f');
        pixel(ctx, x - 2, y - 3, 3, 2, '#f4dcb3');
      }
    }
    if (event.kind === 'birds' && elapsed < 24) {
      for (let i = 0; i < 5; i++) {
        const p = Math.max(0, elapsed - i * .4), x = 656 + p * 12 + i * 17, y = 543 - p * 12 + Math.sin(i) * 12;
        drawBird(ctx, x, y, age * 8 + i, '#d8d5bb');
      }
    }
    if (event.kind === 'stargazing' && life.weather === 'sunny') {
      const p = elapsed % 35;
      if (p > 11 && p < 12.2) {
        const t = (p - 11) / 1.2;
        ctx.globalAlpha = Math.sin(t * Math.PI) * .7;
        ctx.strokeStyle = '#e6dec2'; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(815 + t * 180, 76 + t * 65); ctx.lineTo(795 + t * 180, 68 + t * 65); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  if (calendar.festival?.id === 'halloween' && !badWeather && (life.period === 'evening' || night)) {
    for (let i = 0; i < 3; i++) drawBird(ctx, 727 + Math.sin(age * .23 + i) * 150, 241 + Math.cos(age * .18 + i) * 55, age * 10 + i, '#293337');
  }
  const fireworks = calendar.festival?.id === 'newyear' && time.hour === 0 && time.minute < 10
    || calendar.festival?.id === 'eve' && time.hour === 23 && time.minute >= 58
    || calendar.festival?.id === 'july' && time.hour === 22;
  if (fireworks && !badWeather) {
    for (let burst = 0; burst < 2; burst++) {
      const p = (age + burst * 9) % 24 / 3;
      if (p > 1) continue;
      const cx = burst ? 1080 : 464, cy = burst ? 90 : 55;
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        ctx.globalAlpha = Math.sin(p * Math.PI) * .8;
        pixel(ctx, cx + Math.cos(a) * p * 56, cy + Math.sin(a) * p * 42 + p * p * 17, 3, 3, ['#e8c07a', '#c79a93', '#acc7b4'][i % 3]);
      }
    }
  }
  ctx.restore();
}
function drawBird(ctx, x, y, phase, color) {
  const flap = Math.sin(phase) * 4;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 7, y + flap); ctx.lineTo(x, y); ctx.lineTo(x + 7, y + flap); ctx.stroke();
}
function drawStall(ctx, x, y, color, light) {
  ctx.save(); ctx.globalAlpha = 1 - light * .45;
  pixel(ctx, x - 27, y - 34, 4, 35, '#695138'); pixel(ctx, x + 24, y - 34, 4, 35, '#695138');
  pixel(ctx, x - 28, y - 11, 56, 13, '#8b6841'); pixel(ctx, x - 29, y - 13, 58, 4, '#c59b61');
  pixel(ctx, x - 32, y - 37, 64, 14, color); pixel(ctx, x - 30, y - 41, 60, 7, color);
  for (let i = 0; i < 4; i++) pixel(ctx, x - 28 + i * 16, y - 40, 8, 18, '#e3d4ae');
  pixel(ctx, x - 32, y - 24, 64, 3, '#3b433533');
  for (let i = 0; i < 8; i++) pixel(ctx, x - 24 + i * 6, y - 17, 5, 5, ['#a9b165', '#c98952', '#d6b35d'][i % 3]);
  ctx.restore();
}
function drawGarland(ctx, decor, age) {
  const [a, b] = GARLAND;
  ctx.strokeStyle = '#766344'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(710, 516, b[0], b[1]); ctx.stroke();
  for (let i = 0; i < 11; i++) {
    const t = (i + .5) / 11, x = a[0] + (b[0] - a[0]) * t, y = a[1] + Math.sin(t * Math.PI) * 14;
    const colors = decor === 'winter' ? ['#b55b53', '#e3d8ac', '#6b956e'] : decor === 'pumpkins' ? ['#c69252', '#76716c'] : ['#bc7361', '#dec599', '#759482'];
    ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.lineTo(x + Math.sin(age * 1.2 + i) * 2, y + 15); ctx.fill();
    if (['winter', 'stars'].includes(decor)) pixel(ctx, x - 2, y + 1, 4, 4, '#f2d79d');
  }
}
function drawTree(ctx, x, y, light, age) {
  pixel(ctx, x - 3, y - 12, 7, 14, '#806344');
  for (let i = 0; i < 5; i++) pixel(ctx, x - 6 - i * 5, y - 67 + i * 12, 13 + i * 10, 18, i % 2 ? '#45735b' : '#355e4a');
  for (let i = 0; i < 12; i++) {
    const xx = x + Math.sin(i * 2.4) * (8 + i), yy = y - 54 + i * 4;
    pixel(ctx, xx, yy, 3, 3, i % 2 ? '#d7b36c' : '#b86855');
    if (light > .1) { ctx.fillStyle = '#e8c57f55'; ctx.beginPath(); ctx.arc(xx, yy, 4 + Math.sin(age + i) * .3, 0, Math.PI * 2); ctx.fill(); }
  }
  pixel(ctx, x - 2, y - 75, 5, 11, '#edcf8d'); pixel(ctx, x - 5, y - 72, 11, 4, '#edcf8d');
  pixel(ctx, x - 26, y - 8, 12, 11, '#ae635b'); pixel(ctx, x - 21, y - 8, 2, 11, '#e5cc8d');
}
function drawPumpkin(ctx, x, y, light) {
  if (light > .1) {
    const glow = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, 25);
    glow.addColorStop(0, '#ecb86155'); glow.addColorStop(1, '#ecb86100'); ctx.fillStyle = glow; ctx.fillRect(x - 25, y - 31, 50, 50);
  }
  pixel(ctx, x - 9, y - 12, 18, 11, '#b87e44'); pixel(ctx, x - 5, y - 15, 10, 16, '#d0914e');
  pixel(ctx, x - 1, y - 19, 3, 5, '#6c7047');
  pixel(ctx, x - 5, y - 10, 3, 3, light ? '#f6d68a' : '#684d32'); pixel(ctx, x + 3, y - 10, 3, 3, light ? '#f6d68a' : '#684d32');
}
