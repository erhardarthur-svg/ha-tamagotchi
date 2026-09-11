import { CHURCH } from './world.js?v=4.6';

/** Live hands and a recessed time display on the building itself. */
export function handAngles(hour, minute) {
  return { hour: ((hour % 12) + minute / 60) * Math.PI / 6, minute: minute * Math.PI / 30 };
}
export function drawClockTime(ctx, time, darkness = 0, event = null, age = 0) {
  if (!time) return;
  const { x, y, radius: r } = CHURCH.clock;
  ctx.save(); ctx.translate(x, y);
  if (darkness > .1) {
    const glow = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.8);
    glow.addColorStop(0, `rgba(255,221,161,${darkness * .48})`); glow.addColorStop(1, '#ffd57d00');
    ctx.fillStyle = glow; ctx.fillRect(-r * 1.8, -r * 1.8, r * 3.6, r * 3.6);
    // Illuminate the face so dark hands remain legible after the night tint.
    ctx.fillStyle = `rgba(243,229,196,${darkness * .86})`;
    ctx.beginPath(); ctx.arc(0, 0, r * .94, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    ctx.strokeStyle = '#354039'; ctx.lineWidth = i % 3 ? 2.5 : 4;
    ctx.beginPath(); ctx.moveTo(Math.sin(angle) * r * .79, -Math.cos(angle) * r * .79);
    ctx.lineTo(Math.sin(angle) * r * .9, -Math.cos(angle) * r * .9); ctx.stroke();
  }
  const angles = handAngles(time.hour, time.minute);
  for (const [angle, length, width] of [[angles.hour, r * .52, r * .13], [angles.minute, r * .76, r * .085]]) {
    ctx.save(); ctx.rotate(angle); ctx.strokeStyle = '#20372f';
    ctx.lineWidth = Math.max(2, width); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, r * .1); ctx.lineTo(0, -length); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#bc8d42'; ctx.beginPath(); ctx.arc(0, 0, Math.max(2, r * .09), 0, Math.PI * 2); ctx.fill();
  // Restrained visual chimes; deliberately silent in a Home Assistant tile.
  if (event && event.id === 'noon' && age - event.started < 24) {
    const p = (age - event.started) % 2 / 2;
    ctx.strokeStyle = `rgba(255,226,163,${(1 - p) * .6})`; ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(side * (r + 12 + p * 18), CHURCH.bell.y - y + CHURCH.bell.h / 2, 5 + p * 6, 12 + p * 10, 0, -1.1, 1.1); ctx.stroke();
    }
  }
  ctx.restore();
  const plaque = CHURCH.plaque;
  if (plaque) {
    ctx.save();
    // A projecting brass-framed panel belongs to the tower, even at tile scale.
    ctx.fillStyle = '#26332999'; ctx.fillRect(plaque.x - 4, plaque.y + 4, plaque.w + 10, plaque.h + 3);
    ctx.fillStyle = '#554734'; ctx.fillRect(plaque.x - 4, plaque.y - 4, plaque.w + 8, plaque.h + 8);
    ctx.fillStyle = '#c09d63'; ctx.fillRect(plaque.x - 2, plaque.y - 2, plaque.w + 4, plaque.h + 4);
    ctx.fillStyle = '#253b34'; ctx.fillRect(plaque.x, plaque.y, plaque.w, plaque.h);
    ctx.fillStyle = darkness > .1 ? '#fff0c6' : '#f9e8bc';
    ctx.font = `bold ${Math.floor(plaque.h * .9)}px ui-monospace, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(time.clock, plaque.x + plaque.w / 2, plaque.y + plaque.h * .55, plaque.w - 8);
    ctx.restore();
  }
}
export function drawBell(ctx, image, event, age, darkness) {
  if (!event || event.id !== 'noon' || age - event.started > 24) return;
  ctx.save();
  const { x, y, w, h } = CHURCH.bell;
  ctx.fillStyle = '#333e32'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.translate(x + w / 2, y - 1); ctx.rotate(Math.sin((age - event.started) * Math.PI) * .27);
  ctx.globalAlpha = 1 - darkness * .45;
  ctx.drawImage(image, x, y, w, h, -w / 2, 0, w, h);
  ctx.restore();
}
