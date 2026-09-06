/** Live hands on the church's painted dial, never a floating interface badge. */
export function handAngles(hour, minute) {
  return { hour: ((hour % 12) + minute / 60) * Math.PI / 6, minute: minute * Math.PI / 30 };
}
export function drawClockTime(ctx, time, darkness = 0, event = null, age = 0) {
  if (!time) return;
  ctx.save(); ctx.translate(930, 181);
  if (darkness > .1) {
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 42);
    glow.addColorStop(0, `rgba(255,213,125,${darkness * .55})`); glow.addColorStop(1, '#ffd57d00');
    ctx.fillStyle = glow; ctx.fillRect(-42, -42, 84, 84);
  }
  const angles = handAngles(time.hour, time.minute);
  for (const [angle, length, width] of [[angles.hour, 10, 2.6], [angles.minute, 15, 1.8]]) {
    ctx.save(); ctx.rotate(angle); ctx.strokeStyle = darkness > .5 ? '#fbe3a7' : '#303b34';
    ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -length); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#ac8345'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  // Restrained visual chimes; deliberately silent in a Home Assistant tile.
  if (event && event.id === 'noon' && age - event.started < 24) {
    const p = (age - event.started) % 2 / 2;
    ctx.strokeStyle = `rgba(255,226,163,${(1 - p) * .6})`; ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(side * (29 + p * 16), -56, 5 + p * 6, 12 + p * 10, 0, -1.1, 1.1); ctx.stroke();
    }
  }
  ctx.restore();
}
export function drawBell(ctx, image, event, age, darkness) {
  if (!event || event.id !== 'noon' || age - event.started > 24) return;
  ctx.save();
  ctx.fillStyle = '#333e32'; ctx.fillRect(922, 114, 17, 28);
  ctx.translate(931, 115); ctx.rotate(Math.sin((age - event.started) * Math.PI) * .27);
  ctx.globalAlpha = 1 - darkness * .45;
  ctx.drawImage(image, 924, 116, 14, 24, -7, 0, 14, 24);
  ctx.restore();
}
