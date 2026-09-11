/** Three staggered lunch services keep the tavern lively without a 24-person pile-up. */
export function dailyPlan(v, minute) {
  const lunchStart = 720 + Math.floor(v.id / 8) * 40;
  if (minute >= lunchStart && minute < lunchStart + 35) return { kind: 'meal', target: `seat${v.id % 8}`, icon: 'meal' };
  if (minute >= 480 && minute < 1080 && !(minute >= 720 && minute < 840)) {
    if (v.job === 'jardinage') return { kind: 'garden', icon: 'leaf' };
    if (v.job === 'artisanat') return { kind: 'craft', icon: 'tools' };
    if (v.job === 'livraison') return { kind: 'delivery', icon: 'parcel' };
  }
  if (minute >= 1080 && minute < 1260) return { kind: 'relax', icon: 'heart' };
  return { kind: 'wander', icon: null };
}

export const ACTIVITY_SPOTS = Object.freeze({
  gardenWorkA: { icon: 'water', seconds: 27, facing: 'left', text: 'Au potager, on arrose les jeunes pousses.' },
  gardenWorkB: { icon: 'leaf', seconds: 32, facing: 'left', text: 'La récolte avance doucement au potager.' },
  feeding: { icon: 'grain', seconds: 23, facing: 'left', text: 'Les poules accourent pour quelques graines.' },
  benchA: { icon: 'book', seconds: 38, facing: 'down', text: 'Quelques pages au calme, sur le banc.' },
  benchB: { icon: 'rest', seconds: 25, facing: 'down' },
  fishing: { icon: 'fish', seconds: 42, facing: 'right', text: 'Sur la berge, la pêche demande de la patience.' },
  riverBank: { icon: 'rest', seconds: 18, facing: 'right' },
  musicSpot: { icon: 'music', seconds: 40, facing: 'down', text: 'Un air de musique attire quelques passants.' },
  listenerA: { icon: 'heart', seconds: 24, facing: 'up' },
  listenerB: { icon: 'heart', seconds: 24, facing: 'up' },
  smithA: { icon: 'tools', seconds: 29, facing: 'up', text: 'Les artisans s’activent devant l’atelier.' },
  smithB: { icon: 'tools', seconds: 34, facing: 'up' },
  wellA: { icon: 'water', seconds: 14, facing: 'right' },
  wellB: { icon: 'broom', seconds: 22, facing: 'right', text: 'Un petit coup de balai sur la place.' },
  chatA: { icon: 'rest', seconds: 15, facing: 'right' },
  chatB: { icon: 'rest', seconds: 15, facing: 'left' },
  churchStep: { icon: 'rest', seconds: 17, facing: 'up', text: 'Le gardien s’arrête un instant au pied du clocher.' },
});
const WORK_ROUNDS = {
  jardinage: ['gardenWorkA', 'gardenWorkB', 'feeding', 'wellA'],
  artisanat: ['smithA', 'smithB', 'wellA'],
  livraison: ['workshop', 'inn', 'workshop', 'home', 'garden'],
  peche: ['fishing', 'benchB', 'riverBank'],
  musique: ['musicSpot', 'innLane', 'benchA'],
  entretien: ['wellB', 'feeding', 'wellA', 'chatB'],
  lecture: ['benchA', 'chatA', 'riverBank'],
  enfant: ['west', 'northwest', 'northeast', 'east', 'southeast', 'south', 'southwest'],
  garde: ['westLane', 'churchStep', 'north', 'bridgeWest', 'south', 'innLane'],
};
export function activityRound(v, minute, weather) {
  if (weather === 'rainy' || weather === 'stormy') return ['inn', 'workshop', 'home'];
  if (minute >= 1080) return v.job === 'musique' ? ['musicSpot', 'innLane'] : ['benchA', 'benchB', 'chatA', 'chatB', 'innLane'];
  return WORK_ROUNDS[v.job] || ['chatA', 'benchB', 'wellA', 'riverBank'];
}
export function activityAt(v, weather) {
  if (v.job === 'livraison' && ['inn', 'home', 'workshop', 'garden'].includes(v.node)) return { icon: 'parcel', seconds: 9 };
  if (weather === 'rainy' || weather === 'stormy') return { icon: 'rest', seconds: 10 };
  return ACTIVITY_SPOTS[v.node] || { icon: 'rest', seconds: v.job === 'enfant' ? 2 : 8 };
}

// Monochrome interface pictograms drawn in the same compact bubble system.
export function drawActivityBubble(ctx, icon, x, y, opacity = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1.2, 1.2); ctx.globalAlpha = opacity;
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
  } else if (icon === 'book') {
    line([0, 7], [-10, 4], [-10, -9], [0, -6], [10, -9], [10, 4], [0, 7], [0, -6]);
  } else if (icon === 'fish') {
    ctx.beginPath(); ctx.ellipse(-2, -2, 8, 5, 0, 0, Math.PI * 2); ctx.stroke(); line([6, -2], [11, -7], [11, 3], [6, -2]);
    ctx.fillRect(-6, -4, 2, 2);
  } else if (icon === 'water') {
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.bezierCurveTo(-14, 3, -5, 11, 2, 7); ctx.bezierCurveTo(10, 4, 5, -5, 0, -11); ctx.stroke();
  } else if (icon === 'broom') {
    line([6, -11], [-3, 3]); line([-7, 0], [-11, 6], [0, 10], [3, 4], [-7, 0]);
  } else if (icon === 'grain') {
    line([0, 9], [0, -9]); for (const y of [-7, -2, 3]) { line([-6, y - 3], [0, y]); line([6, y - 3], [0, y]); }
  } else if (icon === 'paw') {
    ctx.beginPath(); ctx.ellipse(0, 3, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    for (const [x, y] of [[-7, -3], [-3, -7], [3, -7], [7, -3]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (icon === 'heart') {
    ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♥', 0, 6);
  } else if (icon === 'gift') {
    ctx.strokeRect(-9, -5, 18, 13); line([-10, -5], [-10, -9], [10, -9], [10, -5]); line([0, -9], [0, 8]);
    line([0, -9], [-5, -13], [-8, -11], [0, -9], [5, -13], [8, -11], [0, -9]);
  } else if (icon === 'flower') {
    line([0, 8], [0, -1]); line([0, 5], [-6, 1]);
    for (const [x, y] of [[0, -9], [-5, -5], [5, -5], [0, -1]]) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.stroke(); }
  } else if (icon === 'star') {
    line([0, -11], [3, -4], [10, -3], [5, 2], [6, 9], [0, 5], [-6, 9], [-5, 2], [-10, -3], [-3, -4], [0, -11]);
  } else if (icon === 'sleep') {
    ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.fillText('z', 0, 5);
  }
  ctx.restore();
}
