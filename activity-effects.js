/** Small animated props extend the existing pixel sprites; no separate animation assets. */
const pixel = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
export function drawActivity(ctx, v, age) {
  if (v.moving || v.route.length) return;
  const beat = Math.sin(age * 3 + v.id), phase = (age + v.id * .3) % 1;
  ctx.save();
  if (v.activity === 'fish') {
    ctx.strokeStyle = '#b39866'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(7, -9); ctx.lineTo(27, -38 + beat); ctx.stroke();
    ctx.strokeStyle = '#d3ddd388'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(27, -38 + beat); ctx.quadraticCurveTo(37, -27, 43, 0); ctx.stroke();
    pixel(ctx, 42, -1 + beat, 3, 3, '#ce744e');
    ctx.strokeStyle = `rgba(208,232,216,${(1 - phase) * .5})`;
    ctx.beginPath(); ctx.ellipse(43, 3, 3 + phase * 8, 2 + phase * 3, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (v.activity === 'water') {
    pixel(ctx, -17, -10, 9, 7, '#688f96'); pixel(ctx, -18, -12, 6, 2, '#a6c8c5');
    pixel(ctx, -24, -9, 8, 2, '#789ea2');
    for (let i = 0; i < 4; i++) { const p = (phase + i * .23) % 1; pixel(ctx, -24 - p * 12, -7 + p * 10, 1.5, 2, '#bee2db99'); }
  } else if (v.activity === 'tools') {
    ctx.translate(8, -13); ctx.rotate(beat * .5);
    pixel(ctx, 0, -10, 2, 12, '#b08d56'); pixel(ctx, -4, -13, 10, 5, '#9fa8a2');
    if (beat > .9) { pixel(ctx, -5, 3, 2, 2, '#edc66d'); pixel(ctx, 8, 5, 2, 2, '#edc66d'); }
  } else if (v.activity === 'broom') {
    ctx.translate(7, -7); ctx.rotate(beat * .2);
    pixel(ctx, 0, -15, 2, 22, '#ac8754'); pixel(ctx, -4, 4, 10, 6, '#c7b179');
    pixel(ctx, 10 + phase * 5, 7, 2, 1, '#c3b18d66');
  } else if (v.activity === 'grain') {
    for (let i = 0; i < 6; i++) { const p = (phase + i * .16) % 1; pixel(ctx, -12 - p * 26, -8 + p * 14, 2, 2, '#d4b86b'); }
  } else if (v.activity === 'book') {
    pixel(ctx, -9, -13, 18, 10, '#866441'); pixel(ctx, -8, -13, 7, 8, '#e3d6ab'); pixel(ctx, 1, -13, 7, 8, '#ede0bb');
    pixel(ctx, beat > .5 ? 1 : -1, -13, 1, 9, '#b6a87f');
  } else if (v.activity === 'music') {
    pixel(ctx, -5, -14, 11, 11, '#b58b4b'); pixel(ctx, 2, -19, 4, 10, '#9e7342');
    pixel(ctx, -1, -11, 3, 4, '#493c2b'); pixel(ctx, 1 + beat * 2, -10, 4, 2, v.skin);
  } else if (v.activity === 'meal') {
    const side = v.facing === 'left' ? -1 : 1;
    pixel(ctx, side * 8 - 2, -12 - Math.max(0, beat) * 6, 4, 3, v.skin);
    pixel(ctx, side * 11 - 2, -12 - Math.max(0, beat) * 6, 3, 2, '#e6cc8b');
  }
  ctx.restore();
}
