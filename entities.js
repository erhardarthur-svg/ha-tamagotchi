import { NODES, findRoute } from './world.js';
import { seededRandom } from './weather.js';

const DESTINATIONS = ['west', 'northwest', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'garden', 'inn', 'cottage', 'workshop', 'bridgeEast'];
const RESIDENTS = [
  { name: 'Arthur', color: '#c69950', skin: '#dab48b', hair: '#4a362e', home: 'inn', start: 'west' },
  { name: 'Lina', color: '#a64e4d', skin: '#d4a680', hair: '#392b29', home: 'cottage', start: 'northeast' },
  { name: 'Milo', color: '#61979b', skin: '#b48565', hair: '#3f3026', home: 'home', start: 'south' },
  { name: 'Nora', color: '#828e4f', skin: '#e6bd95', hair: '#9e693f', home: 'cottage', start: 'southwest' },
  { name: 'Ezra', color: '#8a799f', skin: '#86583d', hair: '#28221f', home: 'workshop', start: 'northwest' },
  { name: 'Sami', color: '#b57247', skin: '#c49a70', hair: '#524133', home: 'home', start: 'east' },
];

function traveller(node, data) {
  return { x: NODES[node][0], y: NODES[node][1], node, route: [], wait: 0, walk: 0, facing: 'down', moving: false, hidden: false, destination: node, speed: 33, ...data };
}
function routeTo(entity, target) {
  // Finish the current edge before changing route: no diagonal shortcuts on state changes.
  const anchor = entity.route[0] || entity.node;
  entity.route = [...(entity.route.length ? [anchor] : []), ...findRoute(anchor, target)];
  entity.destination = target; entity.wait = 0;
}
function walk(entity, dt, speed) {
  entity.moving = false;
  if (!entity.route.length) return;
  const point = NODES[entity.route[0]], dx = point[0] - entity.x, dy = point[1] - entity.y;
  const length = Math.hypot(dx, dy), step = speed * dt;
  if (length <= step) {
    entity.x = point[0]; entity.y = point[1]; entity.node = entity.route.shift();
  } else {
    entity.x += dx / length * step; entity.y += dy / length * step;
  }
  entity.moving = true; entity.walk += step;
  if (Math.abs(dx) > Math.abs(dy)) entity.facing = dx > 0 ? 'right' : 'left';
  else if (Math.abs(dy) > .01) entity.facing = dy > 0 ? 'down' : 'up';
}

export class VillageLife {
  constructor(random = seededRandom(10504)) {
    this.random = random; this.age = 0; this.period = 'day'; this.weather = 'sunny';
    this.event = null; this.nextEvent = 18; this.meetingUntil = 0;
    this.residents = RESIDENTS.map((v, id) => traveller(v.start, { ...v, id, speed: 29 + id * 1.5, wait: 1 + id * 1.7 }));
    this.dog = traveller('westLane', { kind: 'dog', speed: 40, dashUntil: 0 });
    this.cat = traveller('innStep', { kind: 'cat', speed: 24, wait: 9 });
    this.chickens = Array.from({ length: 3 }, (_, i) => ({ kind: 'chicken', x: 151 + i * 28, y: 875 + i * 7, tx: 151 + i * 28, ty: 875 + i * 7, wait: i + 1, walk: 0, facing: 'right', moving: false }));
  }
  shouldShelter(v) {
    return (this.period === 'night' && v.id !== 0) || (this.weather === 'stormy' && v.id !== 0)
      || (this.period === 'evening' && v.id > 3) || (this.weather === 'rainy' && v.id > 3);
  }
  setEnvironment({ period, weather }, initial = false) {
    const changed = period !== this.period || weather !== this.weather;
    this.period = period; this.weather = weather;
    if (!changed && !initial) return;
    this.event = null; this.meetingUntil = 0;
    for (const v of this.residents) {
      if (this.shouldShelter(v)) {
        if (initial) { [v.x, v.y] = NODES[v.home]; v.node = v.home; v.route = []; v.hidden = true; }
        else routeTo(v, v.home);
      } else if (v.hidden) { v.hidden = false; v.wait = this.random() * 10 + 1; }
      else if (!initial) v.wait = this.random() * 3;
    }
  }
  destination(v) {
    if (this.period === 'night' || this.weather === 'stormy') return ['west', 'east', 'bridgeWest', 'south'][Math.floor(this.random() * 4)];
    const choices = this.period === 'morning' && v.id % 2 ? ['garden', 'workshop', 'inn'] : DESTINATIONS;
    return choices[Math.floor(this.random() * choices.length)];
  }
  update(dt) {
    this.age += dt;
    if (this.event && this.age > this.event.until) this.event = null;
    const pace = this.period === 'night' ? .58 : this.period === 'evening' ? .72 : this.period === 'morning' ? .85 : 1;
    for (const v of this.residents) {
      if (v.hidden) continue;
      if (v.route.length) { walk(v, dt, v.speed * pace * (this.weather === 'stormy' ? 1.3 : 1)); continue; }
      v.moving = false;
      if (this.shouldShelter(v) && v.node === v.home) { v.hidden = true; continue; }
      if (this.age < this.meetingUntil && v.id < 3) continue;
      v.wait -= dt;
      if (v.wait > 0) continue;
      if (this.shouldShelter(v)) routeTo(v, v.home);
      else { routeTo(v, this.destination(v)); v.wait = 3 + this.random() * (this.period === 'evening' ? 24 : 12); }
    }
    this.updatePet(this.dog, dt, ['westLane', 'east', 'bridgeEast', 'south', 'innStep']);
    this.updatePet(this.cat, dt, ['innStep', 'innLane', 'northwest', 'west']);
    for (const bird of this.chickens) {
      bird.moving = false;
      if (this.period === 'night' || this.weather === 'stormy') continue;
      const dx = bird.tx - bird.x, dy = bird.ty - bird.y, d = Math.hypot(dx, dy);
      if (d > 1) {
        const step = Math.min(d, dt * 13); bird.x += dx / d * step; bird.y += dy / d * step;
        bird.walk += step; bird.moving = true; bird.facing = dx > 0 ? 'right' : 'left';
      } else if ((bird.wait -= dt) <= 0) {
        bird.tx = 115 + this.random() * 170; bird.ty = 870 + this.random() * 36; bird.wait = 3 + this.random() * 8;
      }
    }
    if (this.age >= this.nextEvent) { this.triggerEvent(); this.nextEvent = this.age + 35 + this.random() * 30; }
  }
  updatePet(pet, dt, points) {
    if (this.period === 'night' || this.weather === 'stormy') {
      if (!pet.hidden && pet.destination !== 'innStep') routeTo(pet, 'innStep');
      if (!pet.route.length && pet.node === 'innStep') { pet.hidden = true; return; }
    } else pet.hidden = false;
    if (pet.hidden) return;
    if (pet.route.length) { walk(pet, dt, pet.speed * (pet.dashUntil > this.age ? 1.65 : 1)); return; }
    pet.moving = false; pet.wait -= dt;
    if (pet.wait <= 0) { routeTo(pet, points[Math.floor(this.random() * points.length)]); pet.wait = 5 + this.random() * 15; }
  }
  triggerEvent() {
    if (this.period === 'night' || this.weather === 'stormy' || this.weather === 'rainy') return;
    const choice = Math.floor(this.random() * 4);
    if (choice === 0) {
      routeTo(this.dog, this.dog.x < 700 ? 'east' : 'westLane'); this.dog.dashUntil = this.age + 13;
      this.event = { text: 'Le chien file à travers la place.', until: this.age + 12 };
    } else if (choice === 1) {
      // Three nearby meeting spots sit just north of the fountain.
      ['meetingA', 'meetingB', 'meetingC'].forEach((id, i) => routeTo(this.residents[i], id));
      this.meetingUntil = this.age + 45;
      this.event = { text: 'Les voisins se retrouvent près de la fontaine.', until: this.age + 16 };
    } else if (choice === 2) {
      routeTo(this.residents[3], 'garden');
      this.event = { text: 'Il est temps de faire un tour au potager.', until: this.age + 12 };
    } else {
      this.cat.wait = 14; this.event = { text: 'Le chat prend son temps, comme toujours.', until: this.age + 10 };
    }
  }
  draw(ctx, light = 0) {
    const characters = [...this.residents, this.dog, this.cat, ...this.chickens].sort((a, b) => a.y - b.y);
    for (const v of characters) {
      if (v.hidden || (v.kind === 'chicken' && (this.period === 'night' || this.weather === 'stormy'))) continue;
      ctx.save(); ctx.translate(Math.round(v.x), Math.round(v.y));
      ctx.fillStyle = this.weather === 'sunny' ? '#14201a60' : '#14201a38';
      ctx.beginPath(); ctx.ellipse(3, 1, v.kind ? 9 : 8, 3.5, -.25, 0, Math.PI * 2); ctx.fill();
      const bob = v.moving ? Math.sin(v.walk * .7) : 0;
      if (v.kind) drawAnimal(ctx, v, bob);
      else drawResident(ctx, v, bob, this.weather, this.period, light);
      ctx.restore();
    }
  }
}

function pixel(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawResident(ctx, v, bob, weather, period, darkness) {
  const stride = v.moving ? Math.round(Math.sin(v.walk * .38) * 2) : 0;
  pixel(ctx, -5, -5 + stride, 4, 6, '#35372d'); pixel(ctx, 2, -5 - stride, 4, 6, '#35372d');
  ctx.translate(0, Math.round(bob));
  pixel(ctx, -7, -18, 14, 13, '#393b30'); pixel(ctx, -6, -18, 12, 11, v.color);
  pixel(ctx, -4, -17, 6, 9, '#ffffff16'); pixel(ctx, -5, -7, 10, 2, '#5a4c36');
  pixel(ctx, -9, -16 - stride, 3, 8, v.color); pixel(ctx, 7, -16 + stride, 3, 8, v.color);
  pixel(ctx, -9, -9 - stride, 3, 3, v.skin); pixel(ctx, 7, -9 + stride, 3, 3, v.skin);
  pixel(ctx, -5, -27, 10, 10, v.hair); pixel(ctx, -6, -25, 12, 6, v.hair);
  if (v.facing !== 'up') {
    pixel(ctx, -4, -22, 8, 6, v.skin);
    pixel(ctx, v.facing === 'left' ? -5 : v.facing === 'right' ? 2 : -2, -21, 3, 2, '#493b2f');
  }
  pixel(ctx, -3, -27, 7, 3, '#ffffff13');
  if (v.id === 0) { pixel(ctx, -7, -26, 14, 3, '#ab8b51'); pixel(ctx, -4, -30, 9, 5, '#c0a16c'); }
  if (darkness > .1) { ctx.fillStyle = `rgba(19,32,52,${darkness * .28})`; ctx.fillRect(-10, -30, 20, 32); }
  if (weather === 'rainy' || weather === 'stormy') {
    ctx.fillStyle = v.id % 2 ? '#7b4644' : '#717e63';
    ctx.beginPath(); ctx.arc(0, -23, 15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e0d6af40'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(Math.cos(a) * 14, -23 + Math.sin(a) * 14); ctx.stroke(); }
    pixel(ctx, -1, -25, 3, 3, '#d6bd8d');
  }
  if (period === 'night' && v.id === 0) {
    const glow = ctx.createRadialGradient(11, -8, 0, 11, -8, 35);
    glow.addColorStop(0, '#ffd58e66'); glow.addColorStop(1, '#ffd58e00'); ctx.fillStyle = glow; ctx.fillRect(-24, -43, 70, 70);
    pixel(ctx, 8, -11, 5, 7, '#5d4831'); pixel(ctx, 9, -10, 3, 4, '#ffe8a5');
  }
}
function drawAnimal(ctx, animal, bob) {
  if (animal.facing === 'left') ctx.scale(-1, 1);
  if (animal.kind === 'chicken') {
    const peck = !animal.moving ? Math.sin(animal.wait * 3) > .7 : false;
    pixel(ctx, -3, -1, 2, 3, '#c7a056'); pixel(ctx, 3, -1, 2, 3, '#c7a056');
    pixel(ctx, -6, -9, 11, 8, '#d9d6bd'); pixel(ctx, -4, -11, 8, 7, '#f3edcf');
    pixel(ctx, -8, -11, 3, 5, '#eee8ce'); pixel(ctx, 4, peck ? -5 : -13, 5, 6, '#f5efd9');
    pixel(ctx, 6, peck ? -6 : -15, 2, 3, '#b8503d'); pixel(ctx, 8, peck ? -2 : -10, 3, 2, '#c79947');
  } else {
    const cat = animal.kind === 'cat', color = cat ? '#64625a' : '#af8051', pale = cat ? '#b3aea0' : '#ddc6a0';
    const stride = animal.moving ? Math.round(bob * 2) : 0;
    pixel(ctx, -9, -3 + stride, 3, 5, '#493e33'); pixel(ctx, 5, -3 - stride, 3, 5, '#493e33');
    pixel(ctx, -11, -11, 19, 9, color); pixel(ctx, -9, -11, 9, 4, pale);
    pixel(ctx, 6, -15, cat ? 7 : 9, 9, color); pixel(ctx, 11, -10, 5, 4, pale);
    pixel(ctx, cat ? 7 : 5, -17, 3, cat ? 5 : 8, '#4e4237');
    if (cat) pixel(ctx, 11, -17, 3, 4, '#49483f');
    pixel(ctx, 12, -13, 2, 2, '#202824');
    pixel(ctx, -14, -10, 5, 3, color); pixel(ctx, -16, -14 + Math.round(bob), 3, 5, color);
  }
}
