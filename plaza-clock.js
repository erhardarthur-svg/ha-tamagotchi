import { PLAZA_CLOCK } from './world.js?v=4.1';

/** A functional clock set into the paving, in world coordinates (not a HUD). */
export function handAngles(hour, minute) {
  return { hour: ((hour % 12) + minute / 60) * Math.PI / 6, minute: minute * Math.PI / 30 };
}
function circle(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}
export function drawClockStonework(ctx) {
  ctx.save(); ctx.translate(PLAZA_CLOCK.x, PLAZA_CLOCK.y);
  // A low stone plinth uses the same overhead projection as the existing plaza.
  circle(ctx, 5, 9, 137, '#28372a45');
  circle(ctx, 0, 4, 135, '#625f4b');
  circle(ctx, 0, 0, 133, '#b5aa85');
  const stones = ['#b9b18c', '#c2b994', '#a8a17e', '#c9bf99', '#aca582'];
  for (let i = 0; i < 28; i++) {
    const a = i * Math.PI / 14, b = (i + 1) * Math.PI / 14;
    ctx.beginPath(); ctx.arc(0, 0, 131, a + .012, b - .012);
    ctx.arc(0, 0, 118, b - .012, a + .012, true); ctx.closePath();
    ctx.fillStyle = stones[i % stones.length]; ctx.fill();
    ctx.fillStyle = '#eee6bc42';
    ctx.fillRect(Math.round(Math.cos(a + .09) * 125), Math.round(Math.sin(a + .09) * 125), 3, 2);
  }
  circle(ctx, 0, 0, 118, '#544f3d');
  circle(ctx, 0, -1, 115, '#b79b5e');
  circle(ctx, 0, -1, 111, '#4d6156');
  const face = ctx.createLinearGradient(-80, -110, 70, 105);
  face.addColorStop(0, '#eee3bf'); face.addColorStop(.6, '#ded4ad'); face.addColorStop(1, '#bcb389');
  circle(ctx, 0, -1, 106, face);
  // Small masonry grain; deterministic and painted only when the ambience changes.
  ctx.fillStyle = '#746d4612';
  for (let i = 0; i < 110; i++) {
    const x = (i * 67 % 199) - 100, y = (i * 43 % 197) - 99;
    if (Math.hypot(x, y) < 102) ctx.fillRect(x, y, 2, 1);
  }
  ctx.translate(0, -21);
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30, major = i % 5 === 0;
    ctx.strokeStyle = major ? '#4c5b47' : '#7d8061'; ctx.lineWidth = major ? 3 : 1;
    ctx.beginPath(); ctx.moveTo(Math.sin(a) * (major ? 75 : 79), -Math.cos(a) * (major ? 75 : 79));
    ctx.lineTo(Math.sin(a) * 84, -Math.cos(a) * 84); ctx.stroke();
  }
  ctx.font = 'bold 24px Georgia, serif'; ctx.fillStyle = '#364c3e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [label, x, y] of [['12', 0, -62], ['3', 65, 0], ['9', -65, 0]]) ctx.fillText(label, x, y);
  ctx.restore();
}

export function drawClockTime(ctx, time, darkness = 0) {
  if (!time) return;
  ctx.save(); ctx.translate(PLAZA_CLOCK.x, PLAZA_CLOCK.y);
  if (darkness > .1) {
    const light = ctx.createRadialGradient(0, -5, 12, 0, -5, 129);
    light.addColorStop(0, `rgba(254,213,125,${darkness * .26})`); light.addColorStop(1, '#fbd38400');
    ctx.fillStyle = light; ctx.fillRect(-135, -140, 270, 275);
    for (const angle of [-2.35, -.79, .79, 2.35]) circle(ctx, Math.cos(angle) * 123, Math.sin(angle) * 123, 2.5, '#f7d795');
  }
  const angles = handAngles(time.hour, time.minute);
  ctx.save(); ctx.translate(0, -21);
  for (const [angle, length, width, color] of [
    [angles.hour, 45, 7, darkness > .45 ? '#e7cf98' : '#294a3d'],
    [angles.minute, 69, 4, darkness > .45 ? '#ffe4ab' : '#865e33'],
  ]) {
    ctx.save(); ctx.rotate(angle); ctx.lineCap = 'round';
    ctx.strokeStyle = '#18271c36'; ctx.lineWidth = width + 2; ctx.beginPath(); ctx.moveTo(2, 10); ctx.lineTo(2, -length + 2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, -length); ctx.stroke();
    ctx.restore();
  }
  circle(ctx, 0, 0, 7, '#96743f'); circle(ctx, -1, -1, 3.5, darkness > .45 ? '#f4d899' : '#dfc895');
  ctx.restore();
  // The time/date are recessed into the stone face below the hands, not over the scene.
  ctx.fillStyle = '#938257'; ctx.fillRect(-85, 50, 170, 39);
  ctx.fillStyle = darkness > .45 ? '#1c3029' : '#304e40'; ctx.fillRect(-82, 52, 164, 35);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 40px monospace';
  ctx.fillStyle = darkness > .45 ? '#ffe2a1' : '#f0e2b5'; ctx.fillText(time.clock, 0, 71, 153);
  ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = darkness > .45 ? '#dec79b' : '#394f3d';
  ctx.fillText(time.shortDate, 0, 98, 137);
  ctx.restore();
}
