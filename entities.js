import { NODES, SQUARE } from './world.js?v=4.5';
import { routeTo, walk } from './navigation.js?v=4.5';
import { drawActivity } from './activity-effects.js?v=4.5';
import { seededRandom } from './weather.js?v=4.5';
import { dailyPlan, drawActivityBubble, activityRound, activityAt, ACTIVITY_SPOTS } from './routines.js?v=4.5';

const DESTINATIONS = ['west', 'northwest', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'garden', 'inn', 'cottage', 'workshop', 'bridgeEast'];
const STARTS = [...DESTINATIONS, 'chatA', 'chatB', 'riverBank', 'benchB', 'wellA', 'gardenWorkA', 'feedingLane', 'northPath', 'southLane', 'westPath', 'workshopStep'];
const PALETTE = [
  { name: 'Arthur', color: '#c69950', skin: '#dab48b', hair: '#4a362e', home: 'inn', start: 'west' },
  { name: 'Lina', color: '#a64e4d', skin: '#d4a680', hair: '#392b29', home: 'cottage', start: 'northeast' },
  { name: 'Milo', color: '#61979b', skin: '#b48565', hair: '#3f3026', home: 'home', start: 'south' },
  { name: 'Nora', color: '#828e4f', skin: '#e6bd95', hair: '#9e693f', home: 'cottage', start: 'southwest' },
  { name: 'Ezra', color: '#8a799f', skin: '#86583d', hair: '#28221f', home: 'workshop', start: 'northwest' },
  { name: 'Sami', color: '#b57247', skin: '#c49a70', hair: '#524133', home: 'home', start: 'east' },
];
const NAMES = ['Arthur', 'Lina', 'Milo', 'Nora', 'Ezra', 'Sami', 'Rose', 'Léon', 'Jade', 'Noé', 'Alma', 'Hugo', 'Iris', 'Paul', 'Lou', 'Émile', 'Anna', 'Jules', 'Zoé', 'Adam', 'Alice', 'Oscar', 'Maya', 'Eli'];
const JOBS = ['garde', 'livraison', 'jardinage', 'musique', 'artisanat', 'peche', 'entretien', 'livraison', 'garde', 'lecture', 'livraison', 'jardinage', 'entretien', 'musique', 'artisanat', 'peche', 'garde', 'lecture', 'livraison', 'jardinage', 'enfant', 'lecture', 'enfant', 'entretien'];
const RESIDENTS = NAMES.map((name, id) => ({ ...PALETTE[id % PALETTE.length], name,
  home: ['inn', 'home', 'workshop'][id % 3], start: STARTS[id], job: JOBS[id % JOBS.length] }));

function traveller(node, data) {
  return { x: NODES[node][0], y: NODES[node][1], node, route: [], wait: 0, walk: 0, facing: 'down', moving: false, hidden: false, destination: node, speed: 33, velocity: 0, offsetX: 0, offsetY: 0, activity: 'walk', socialUntil: 0, socialCooldown: 0, ...data };
}
export class VillageLife {
  constructor(random = seededRandom(10504)) {
    this.random = random; this.age = 0; this.period = 'day'; this.weather = 'sunny';
    this.event = null; this.nextEvent = 18; this.nextNotice = 0;
    this.scheduled = null;
    this.minute = 10 * 60; this.nextSocial = 2;
    this.residents = RESIDENTS.map((v, id) => traveller(v.start, { ...v, id, speed: (v.job === 'enfant' ? 36 : 29) + id % 7 * 1.3, wait: .3 + id % 8 * .45, taskIndex: id % 3, carrying: false, cueUntil: 0, cue: null }));
    this.dog = traveller('westLane', { kind: 'dog', speed: 40, dashUntil: 0 });
    this.cat = traveller('innStep', { kind: 'cat', speed: 24, wait: 9 });
    this.chickens = Array.from({ length: 3 }, (_, i) => ({ kind: 'chicken', x: 151 + i * 28, y: 875 + i * 7, tx: 151 + i * 28, ty: 875 + i * 7, wait: i + 1, walk: 0, facing: 'right', moving: false }));
  }
  shouldShelter(v) {
    if (this.scheduled && v.id < this.scheduled.count) return false;
    if (dailyPlan(v, this.minute).kind === 'meal' && this.weather !== 'stormy') return false;
    return (this.period === 'night' && v.id % 8 !== 0) || (this.weather === 'stormy' && v.id % 8 !== 0)
      || (this.period === 'evening' && v.id > 11) || (this.weather === 'rainy' && v.id > 13);
  }
  plan(v) {
    const plan = dailyPlan(v, this.minute);
    if (plan.kind === 'meal' && this.weather === 'rainy') return { ...plan, target: 'inn' };
    return plan;
  }
  setEnvironment({ period, weather }, initial = false) {
    const changed = period !== this.period || weather !== this.weather;
    this.period = period; this.weather = weather;
    if (!changed && !initial) return;
    if (!this.scheduled) this.event = null;
    this.dog.friend = null;
    for (const v of this.residents) {
      if (this.shouldShelter(v)) {
        if (initial) { [v.x, v.y] = NODES[v.home]; v.node = v.home; v.route = []; v.hidden = true; }
        else routeTo(v, v.home);
      } else if (v.hidden) { v.hidden = false; v.wait = this.random() * 10 + 1; }
      else if (!initial) v.wait = this.random() * 3;
      if (!this.scheduled && !this.shouldShelter(v) && this.plan(v).kind === 'meal') routeTo(v, this.plan(v).target);
    }
  }
  setClock(time) {
    const minute = time.hour * 60 + time.minute;
    if (minute === this.minute) return;
    this.minute = minute;
    for (const v of this.residents) {
      const plan = this.plan(v);
      if (v.planKind !== plan.kind) {
        v.planKind = plan.kind; v.socialUntil = 0;
        if (!this.scheduled && !this.shouldShelter(v)) {
          v.hidden = false;
          routeTo(v, plan.target || this.destination(v));
          v.departureDelay = (v.id % 8) * 1.2;
        }
      }
    }
  }
  destination(v) {
    const plan = this.plan(v);
    if (plan.kind === 'meal') return plan.target;
    if (this.period === 'night' || this.weather === 'stormy') return ['west', 'east', 'bridgeWest', 'south'][Math.floor(this.random() * 4)];
    const round = activityRound(v, this.minute, this.weather);
    const choices = [...round.slice(v.taskIndex % round.length), ...round.slice(0, v.taskIndex % round.length)];
    // An activity spot is reserved from departure until its visitor leaves.
    const available = node => node !== v.node && this.residents.filter(other => other !== v && !other.hidden && other.destination === node).length < (ACTIVITY_SPOTS[node] ? 1 : 2);
    const target = choices.find(available) || DESTINATIONS.filter(available)[Math.floor(this.random() * DESTINATIONS.filter(available).length)] || v.node;
    v.taskIndex = (round.indexOf(target) + 1 + round.length) % round.length;
    return target;
  }
  send(v, target) { routeTo(v, target, this.residents); }
  notice(text) {
    if (!text || this.scheduled || this.age < this.nextNotice) return;
    this.event = { text, until: this.age + 10 }; this.nextNotice = this.age + 22;
  }
  greet(v) {
    if (!v || v.hidden) return;
    v.cue = 'heart'; v.cueUntil = this.age + 4;
    const roles = { garde: 'veilleur', livraison: 'livreur', jardinage: 'jardinier', musique: 'musicien', artisanat: 'artisan', peche: 'pêcheur', entretien: 'gardien du village', lecture: 'amateur de lecture', enfant: 'jeune du village' };
    this.event = { text: `${v.name}, ${roles[v.job] || 'habitant'}, vous fait un signe.`, until: this.age + 7 };
  }
  startAppointment(event) {
    this.scheduled = { ...event, started: this.age, until: this.age + event.duration, wallUntil: Date.now() + event.duration * 1000 };
    this.event = this.scheduled;
    this.residents.forEach(v => {
      if (v.id >= event.count) return;
      v.hidden = false; v.lantern = event.id === 'night';
      v.departureDelay = v.id * .35;
      routeTo(v, `gather${v.id}`);
    });
  }
  endAppointment() {
    this.scheduled = null; this.event = null; this.nextEvent = this.age + 25;
    for (const v of this.residents) {
      v.lantern = false;
      if (!v.hidden) routeTo(v, this.shouldShelter(v) ? v.home : this.destination(v));
    }
  }
  update(dt) {
    this.age += dt;
    if (this.scheduled && this.age > this.scheduled.until) this.endAppointment();
    if (this.event && this.age > this.event.until) this.event = null;
    const pace = this.period === 'night' ? .58 : this.period === 'evening' ? .72 : this.period === 'morning' ? .85 : 1;
    for (const v of this.residents) {
      if (v.hidden) continue;
      if (v.departureDelay > 0) { v.departureDelay -= dt; v.moving = false; continue; }
      if (v.route.length) { walk(v, dt, v.speed * pace * (this.weather === 'stormy' ? 1.3 : 1), this.residents); continue; }
      v.moving = false;
      v.offsetX *= Math.max(0, 1 - dt * 5); v.offsetY *= Math.max(0, 1 - dt * 5);
      if (this.scheduled && v.id < this.scheduled.count) {
        v.facing = this.scheduled.id === 'noon' ? 'up' : v.x < SQUARE.x ? 'right' : 'left';
        if (this.scheduled.id === 'night' && this.age - this.scheduled.started > 55 && v.destination.startsWith('gather')) routeTo(v, 'bridgeWest');
        continue;
      }
      if (this.shouldShelter(v) && v.node === v.home) { v.hidden = true; continue; }
      const plan = this.plan(v);
      if (!this.shouldShelter(v) && plan.kind === 'meal' && v.node === plan.target) {
        v.activity = 'meal'; v.facing = v.id % 2 ? 'left' : 'right';
        if (v.node === 'inn') v.hidden = true;
        continue;
      }
      if (v.socialUntil > this.age) { v.activity = 'chat'; continue; }
      if (v.activity === 'walk') {
        const task = activityAt(v, this.weather);
        v.activity = task.icon; v.wait = task.seconds + this.random() * 6; v.activityStarted = this.age;
        if (task.facing) v.facing = task.facing;
        this.notice(task.text);
        if (v.activity === 'parcel') {
          v.carrying = v.node === 'workshop';
          this.notice(v.carrying ? 'Une nouvelle livraison quitte l’atelier.' : 'Un colis arrive à destination.');
          v.cue = 'parcel'; v.cueUntil = this.age + 5;
        }
        if (v.activity === 'music') {
          ['listenerA', 'listenerB'].forEach(node => {
            if (this.residents.some(other => !other.hidden && other.destination === node)) return;
            const listener = this.residents.find(other => other !== v && !other.hidden && !other.route.length && other.activity === 'rest' && Math.hypot(v.x - other.x, v.y - other.y) < 240 && this.plan(other).kind !== 'meal');
            if (listener) this.send(listener, node);
          });
        }
      }
      v.wait -= dt;
      if (v.wait > 0) continue;
      if (this.shouldShelter(v)) this.send(v, v.home);
      else this.send(v, this.destination(v));
    }
    if (this.age > this.nextSocial) { this.startConversation(); this.nextSocial = this.age + 2; }
    this.updatePet(this.dog, dt, ['westLane', 'east', 'bridgeEast', 'south', 'innStep']);
    this.updatePet(this.cat, dt, ['innStep', 'innLane', 'northwest', 'west']);
    const feeder = this.residents.find(v => !v.hidden && !v.route.length && v.activity === 'grain');
    for (const bird of this.chickens) {
      bird.moving = false;
      if (this.period === 'night' || this.weather === 'stormy') continue;
      const dx = bird.tx - bird.x, dy = bird.ty - bird.y, d = Math.hypot(dx, dy);
      if (d > 1) {
        const step = Math.min(d, dt * 13); bird.x += dx / d * step; bird.y += dy / d * step;
        bird.walk += step; bird.moving = true; bird.facing = dx > 0 ? 'right' : 'left';
      } else if ((bird.wait -= dt) <= 0) {
        bird.tx = feeder ? feeder.x - 15 - this.random() * 25 : 115 + this.random() * 170;
        bird.ty = feeder ? feeder.y - 9 + this.random() * 18 : 870 + this.random() * 36;
        bird.wait = feeder ? .5 + this.random() * 2 : 3 + this.random() * 8;
      }
    }
    if (this.age >= this.nextEvent) { this.triggerEvent(); this.nextEvent = this.age + 35 + this.random() * 30; }
  }
  startConversation() {
    if (this.scheduled || ['night'].includes(this.period) || ['rainy', 'stormy'].includes(this.weather)) return;
    for (const v of this.residents) {
      if (v.partner !== null && v.partner !== undefined && v.socialUntil > this.age) {
        const partner = this.residents[v.partner];
        if (partner.hidden || partner.route.length) { v.socialUntil = 0; v.partner = null; v.activity = 'rest'; }
      }
    }
    const available = this.residents.filter(v => !v.hidden && !v.route.length && v.socialUntil <= this.age && v.socialCooldown <= this.age && ['rest', 'chat'].includes(v.activity) && !this.shouldShelter(v));
    for (const a of available) {
      const b = available.find(v => v !== a && Math.hypot(v.x - a.x, v.y - a.y) > 12 && Math.hypot(v.x - a.x, v.y - a.y) < 48);
      if (!b) continue;
      const until = this.age + 7 + this.random() * 5;
      for (const [v, partner] of [[a, b], [b, a]]) {
        v.socialUntil = until; v.socialCooldown = this.age + 45; v.partner = partner.id;
        v.activity = 'chat'; v.wait = 2; v.cue = 'chat'; v.cueUntil = until;
        v.facing = partner.x > v.x ? 'right' : 'left';
      }
      return;
    }
  }
  updatePet(pet, dt, points) {
    if (this.period === 'night' || this.weather === 'stormy') {
      if (!pet.hidden && pet.destination !== 'innStep') routeTo(pet, 'innStep');
      if (!pet.route.length && pet.node === 'innStep') { pet.hidden = true; return; }
    } else pet.hidden = false;
    if (pet.hidden) return;
    if (pet.route.length) { walk(pet, dt, pet.speed * (pet.dashUntil > this.age ? 1.65 : 1)); return; }
    pet.moving = false; pet.wait -= dt;
    if (pet.kind === 'dog' && pet.friend !== null && pet.friend !== undefined) {
      const friend = this.residents[pet.friend];
      if (this.age > pet.friendUntil || friend.hidden || this.shouldShelter(friend) || this.period === 'night' || this.weather === 'stormy') pet.friend = null;
      else {
        if (Math.hypot(friend.x - pet.x, friend.y - pet.y) < 36 && !friend.route.length && friend.activity === 'rest') {
          pet.wait = 5; friend.wait = Math.max(friend.wait, 5); friend.cue = 'paw'; friend.cueUntil = this.age + 5;
          pet.friend = null; this.notice(`${friend.name} s’arrête pour caresser le chien.`);
        } else if (pet.wait <= 0 && pet.node !== friend.node) { routeTo(pet, friend.node); pet.wait = 1.5; }
        return;
      }
    }
    if (pet.wait <= 0) { routeTo(pet, points[Math.floor(this.random() * points.length)]); pet.wait = 5 + this.random() * 15; }
  }
  triggerEvent() {
    if (this.scheduled) return;
    if (this.minute >= 720 && this.minute < 840) return;
    if (this.period === 'night' || this.weather === 'stormy' || this.weather === 'rainy') return;
    const choice = Math.floor(this.random() * 7);
    if (choice === 0) {
      routeTo(this.dog, this.dog.x < 700 ? 'east' : 'westLane'); this.dog.dashUntil = this.age + 13;
      this.event = { text: 'Le chien file à travers la place.', until: this.age + 12 };
    } else if (choice === 1) {
      this.startConversation();
    } else if (choice === 2) {
      this.triggerMoment('feeding');
    } else if (choice === 3) {
      this.cat.wait = 14; this.event = { text: 'Le chat prend son temps, comme toujours.', until: this.age + 10 };
    } else if (choice === 4) this.triggerMoment('music');
    else if (choice === 5) this.triggerMoment('dog');
    else this.triggerMoment('fishing');
  }
  triggerMoment(kind) {
    if (this.scheduled || this.period === 'night' || ['rainy', 'stormy'].includes(this.weather)) return false;
    if (kind === 'dog') {
      const friend = this.residents.find(v => !v.hidden && this.plan(v).kind !== 'meal' && !this.shouldShelter(v) && Math.hypot(v.x - this.dog.x, v.y - this.dog.y) < 400);
      if (!friend) return false;
      this.dog.friend = friend.id; this.dog.friendUntil = this.age + 45; this.dog.wait = 0;
      this.notice(`Le chien accompagne ${friend.name} dans sa promenade.`); return true;
    }
    const node = { feeding: 'feeding', fishing: 'fishing', music: 'musicSpot' }[kind];
    if (!node || this.residents.some(v => !v.hidden && v.destination === node)) return false;
    const job = { feeding: 'jardinage', fishing: 'peche', music: 'musique' }[kind];
    const resident = this.residents.find(v => v.job === job && !v.hidden && this.plan(v).kind !== 'meal' && !this.shouldShelter(v));
    if (!resident) return false;
    this.send(resident, node); return true;
  }
  draw(ctx, light = 0) {
    const characters = [...this.residents, this.dog, this.cat, ...this.chickens].sort((a, b) => a.y - b.y);
    for (const v of characters) {
      if (v.hidden || (v.kind === 'chicken' && (this.period === 'night' || this.weather === 'stormy'))) continue;
      ctx.save(); ctx.translate(v.x + (v.offsetX || 0), v.y + (v.offsetY || 0));
      ctx.fillStyle = this.weather === 'sunny' ? '#14201a60' : '#14201a38';
      ctx.beginPath(); ctx.ellipse(3, 1, v.kind ? 9 : 8, 3.5, -.25, 0, Math.PI * 2); ctx.fill();
      const dancing = this.scheduled?.id === 'afternoon' && v.id < this.scheduled.count && !v.route.length;
      const bob = v.moving ? Math.sin(v.walk * .52) * .7 : dancing ? Math.sin(this.age * 5 + v.id) * 2 : Math.sin(this.age * 1.3 + (v.id || 0)) * .2;
      if (v.kind) drawAnimal(ctx, v, bob);
      else {
        if (v.job === 'enfant') ctx.scale(.84, .84);
        drawResident(ctx, v, bob, this.weather, this.period, light);
        drawActivity(ctx, v, this.age);
      }
      ctx.restore();
    }
    // Draw bubbles last, capped and spaced so activity never hides the whole village.
    const bubbles = [];
    for (const v of this.residents) {
      const phase = (this.age + v.id * 1.73) % 11, cued = v.cueUntil > this.age;
      if (v.hidden || (v.moving && !cued) || (!cued && (phase > 3.6 || v.route.length))) continue;
      const icon = cued ? v.cue : this.scheduled?.id === 'afternoon' && v.id < this.scheduled.count ? 'music' : v.activity === 'rest' ? null : v.activity;
      if (!['meal', 'chat', 'leaf', 'tools', 'parcel', 'music', 'fish', 'water', 'broom', 'grain', 'book', 'paw', 'heart'].includes(icon)) continue;
      if (bubbles.length >= 5 || bubbles.some(p => Math.hypot(p.x - v.x, p.y - v.y) < 45)) continue;
      drawActivityBubble(ctx, icon, v.x, v.y - 48, cued ? 1 : Math.min(1, phase * 4, (3.6 - phase) * 4)); bubbles.push(v);
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
  if (v.id % 4 === 0) { pixel(ctx, -7, -26, 14, 3, '#ab8b51'); pixel(ctx, -4, -30, 9, 5, '#c0a16c'); }
  if (v.carrying && v.activity !== 'meal') { pixel(ctx, 5, -12, 10, 9, '#9b7043'); pixel(ctx, 6, -11, 8, 2, '#cfaa69'); }
  if (v.activity === 'leaf' && !v.moving) { pixel(ctx, 10, -19, 2, 21, '#976a3b'); pixel(ctx, 7, -20, 8, 3, '#809392'); }
  if (darkness > .1) { ctx.fillStyle = `rgba(19,32,52,${darkness * .28})`; ctx.fillRect(-10, -30, 20, 32); }
  if (v.lantern || (period === 'night' && v.id % 8 === 0)) {
    const glow = ctx.createRadialGradient(11, -8, 0, 11, -8, 35);
    glow.addColorStop(0, '#ffd58e66'); glow.addColorStop(1, '#ffd58e00'); ctx.fillStyle = glow; ctx.fillRect(-24, -43, 70, 70);
    pixel(ctx, 8, -11, 5, 7, '#5d4831'); pixel(ctx, 9, -10, 3, 4, '#ffe8a5');
  }
}
function drawAnimal(ctx, animal, bob) {
  if (animal.facing === 'left') ctx.scale(-1, 1);
  if (animal.kind === 'cat' && !animal.moving && animal.wait > 7) ctx.scale(1, .65);
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
