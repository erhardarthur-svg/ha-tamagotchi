/** Three staggered lunch services keep the tavern lively without a 24-person pile-up. */
export function dailyPlan(v, minute) {
  const lunchStart = 720 + Math.floor(v.id / 8) * 40;
  if (minute >= lunchStart && minute < lunchStart + 35) return { kind: 'meal', target: `seat${v.id % 8}`, icon: 'meal' };
  if (minute >= 480 && minute < 1080 && !(minute >= 720 && minute < 840)) {
    if (v.job === 'jardinage') return { kind: 'garden', target: 'garden', icon: 'leaf' };
    if (v.job === 'artisanat') return { kind: 'craft', target: 'workshop', icon: 'tools' };
    if (v.job === 'livraison') return { kind: 'delivery', icon: 'parcel' };
  }
  if (minute >= 1080 && minute < 1260) return { kind: 'relax', icon: 'heart' };
  return { kind: 'wander', icon: null };
}

// Monochrome interface pictograms drawn in the same compact bubble system.
export function drawActivityBubble(ctx, icon, x, y, opacity = 1) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = opacity;
  ctx.fillStyle = '#172d2ac9'; ctx.beginPath(); ctx.roundRect(-15, -14, 30, 25, 5); ctx.fill();
  ctx.strokeStyle = '#d9cda9'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#172d2a'; ctx.beginPath(); ctx.moveTo(-3, 11); ctx.lineTo(0, 15); ctx.lineTo(4, 11); ctx.fill();
  ctx.strokeStyle = '#f2e5bf'; ctx.fillStyle = '#f2e5bf'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (...points) => { ctx.beginPath(); ctx.moveTo(...points[0]); for (const point of points.slice(1)) ctx.lineTo(...point); ctx.stroke(); };
  if (icon === 'meal') {
    ctx.beginPath(); ctx.arc(1, -2, 6, 0, Math.PI * 2); ctx.stroke();
    line([-10, -9], [-10, 7]); line([-13, -9], [-13, -4], [-7, -4], [-7, -9]); line([11, -9], [11, 7]);
  } else if (icon === 'chat') {
    for (const x of [-7, 0, 7]) { ctx.beginPath(); ctx.arc(x, -2, 1.7, 0, Math.PI * 2); ctx.fill(); }
  } else if (icon === 'music') {
    line([-3, 4], [-3, -8], [7, -10], [7, 2]);
    ctx.beginPath(); ctx.ellipse(-6, 5, 3, 2, -.4, 0, Math.PI * 2); ctx.ellipse(4, 3, 3, 2, -.4, 0, Math.PI * 2); ctx.fill();
  } else if (icon === 'leaf') {
    ctx.beginPath(); ctx.ellipse(1, -3, 5, 9, .7, 0, Math.PI * 2); ctx.stroke(); line([-7, 8], [6, -9]);
  } else if (icon === 'tools') {
    line([-7, 7], [5, -7]); line([0, -9], [8, -2]); line([-7, -8], [7, 7]);
  } else if (icon === 'parcel') {
    ctx.strokeRect(-8, -9, 16, 15); line([-8, -5], [8, -5]); line([0, -9], [0, 6]);
  } else if (icon === 'heart') {
    ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♥', 0, 6);
  } else if (icon === 'sleep') {
    ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.fillText('z', 0, 5);
  }
  ctx.restore();
}
