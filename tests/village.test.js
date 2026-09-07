import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { VillageClock, periodForHour } from '../time.js';
import { VillageWeather, WeatherEffects, simulatedWeather, normalizeWeather } from '../weather.js';
import { NODES, GRAPH, SOLID_AREAS, FOUNTAIN, findRoute } from '../world.js';
import { handAngles } from '../church-clock.js';
import { APPOINTMENTS, VillageAppointments } from '../events.js';
import { dailyPlan, ACTIVITY_SPOTS } from '../routines.js';
import { walkable } from '../navigation.js';
import { VillageLife } from '../entities.js';
import { sanitizeState, acceptsMessage } from '../bridge.js';

test('clock boundaries, timezone, midnight rollover and HA clock continue ticking', () => {
  assert.deepEqual([0, 5, 6, 9, 10, 17, 18, 21, 22, 23].map(periodForHour), ['night', 'night', 'morning', 'morning', 'day', 'day', 'evening', 'evening', 'night', 'night']);
  let now = Date.parse('2026-09-05T21:59:30Z');
  const clock = new VillageClock(() => now);
  clock.setExternal({ datetime: new Date(now).toISOString(), timeZone: 'Europe/Paris' });
  assert.equal(clock.read().clock, '23:59');
  const oldDay = clock.read().dayKey;
  now += 60000;
  assert.equal(clock.read().clock, '00:00'); assert.notEqual(clock.read().dayKey, oldDay);
  clock.force('morning'); assert.equal(clock.read().clock, '07:00');
  clock.force(null); assert.equal(clock.read().clock, '00:00');
  clock.setExternal({ datetime: 'bad', timeZone: 'invalid' }); assert.equal(clock.read().clock, '00:00');
});

test('weather and time overrides are independent; Auto restores incoming HA data', () => {
  const clock = new VillageClock(() => Date.parse('2026-01-05T12:30:00Z'));
  clock.setExternal({ timeZone: 'UTC' });
  const weather = new VillageWeather(), original = weather.read(clock.read());
  clock.force('night'); assert.deepEqual(weather.read(clock.read()), original);
  weather.setExternal('rainy'); weather.force('snowy');
  assert.equal(weather.read(clock.read()).kind, 'snowy');
  weather.setExternal('lightning-rainy'); weather.force(null); clock.force(null);
  assert.deepEqual(weather.read(clock.read()), { kind: 'stormy', source: 'ha' });
  weather.setExternal('unavailable'); assert.equal(weather.read(clock.read()).source, 'simulation');
});

test('simulation is deterministic, seasonal and constant within the same weather slot', () => {
  const time = { dayKey: '2026-9-5', hour: 12, month: 9 };
  assert.equal(simulatedWeather(time), simulatedWeather({ ...time, hour: 14 }));
  for (let day = 1; day <= 31; day++) assert.notEqual(simulatedWeather({ dayKey: `2026-7-${day}`, month: 7, hour: 12 }), 'snowy');
  for (const invalid of ['__proto__', 'constructor', 'unavailable', '', null, {}, 1]) assert.equal(normalizeWeather(invalid), null);
});

test('all destinations connect, and every route avoids buildings, fountain and unbridged river', () => {
  for (const from of Object.keys(NODES)) for (const to of Object.keys(NODES)) {
    if (from !== to) assert.equal(findRoute(from, to).at(-1), to, `${from} -> ${to}`);
  }
  for (const [from, neighbors] of Object.entries(GRAPH)) for (const to of neighbors) {
    const a = NODES[from], b = NODES[to];
    for (let t = 0; t <= 1; t += .02) {
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      for (const rect of SOLID_AREAS) assert.ok(!(x > rect.x && x < rect.x + rect.w && y > rect.y && y < rect.y + rect.h), `${from} -> ${to} enters building at ${x},${y}`);
      assert.ok(Math.hypot(x - FOUNTAIN.x, y - FOUNTAIN.y) > FOUNTAIN.radius, `${from} -> ${to} enters fountain`);
      if (x > 1190) assert.ok(Math.abs(y - 466) < 1, 'river crossed outside the bridge');
    }
  }
});

test('villagers come home at night, stay sheltered, and resume after dawn', () => {
  const life = new VillageLife();
  for (let i = 0; i < 3000; i++) life.update(1 / 30);
  life.setEnvironment({ period: 'night', weather: 'sunny' });
  for (let i = 0; i < 7500; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => v.hidden).length, 21);
  assert.equal(life.residents[0].hidden, false);
  assert.ok(life.dog.hidden && life.cat.hidden);
  assert.equal(life.event, null);
  const locations = life.residents.filter(v => v.hidden).map(v => [v.x, v.y]);
  for (let i = 0; i < 900; i++) life.update(1 / 30);
  assert.deepEqual(life.residents.filter(v => v.hidden).map(v => [v.x, v.y]), locations);
  life.setEnvironment({ period: 'morning', weather: 'sunny' });
  for (let i = 0; i < 900; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => !v.hidden).length, 24);
  assert.ok(life.residents.some(v => v.route.length));
});

test('rapid environment changes preserve continuity and animal speeds stay bounded', () => {
  const life = new VillageLife();
  for (let i = 0; i < 12000; i++) {
    if (i % 900 === 0) life.setEnvironment({ period: i % 1800 ? 'night' : 'day', weather: i % 2700 ? 'sunny' : 'stormy' });
    const before = life.residents.map(v => [v.x, v.y]);
    life.update(1 / 30);
    life.residents.forEach((v, j) => {
      assert.ok(Number.isFinite(v.x) && Number.isFinite(v.y));
      assert.ok(Math.hypot(v.x - before[j][0], v.y - before[j][1]) <= 2, 'teleport on environment change');
    });
    assert.equal(life.dog.speed, 40); assert.equal(life.cat.speed, 24);
  }
});

test('weather particle count and storm flashes remain bounded, reduced motion removes lightning', () => {
  const effects = new WeatherEffects(1536, 1024);
  effects.setWeather('stormy'); let flashes = 0, previous = 0;
  for (let i = 0; i < 18000; i++) {
    effects.update(1 / 30); if (effects.flash > previous) flashes++;
    previous = effects.flash; assert.ok(effects.flash <= .2);
  }
  assert.ok(flashes >= 10 && flashes <= 34); assert.equal(effects.particles.length, 135);
  effects.flash = .2; effects.update(1, true); assert.equal(effects.flash, 0);
  const age = effects.age; effects.update(100, true); assert.equal(effects.age, age);
});

test('HA input is validated and cross-origin messages cannot spoof the parent', () => {
  assert.equal(sanitizeState(null), null); assert.equal(sanitizeState([]), null);
  assert.equal(sanitizeState({ weather: '__proto__', datetime: 'bad', timeZone: 'bad' }), null);
  assert.deepEqual(sanitizeState({ weather: 'lightning-rainy', token: 'not-forwarded' }), { weather: 'stormy' });
  assert.deepEqual(sanitizeState({ weather: 'unavailable' }), { weather: null });
  const parent = {}, child = { parent }, origin = 'https://ha.example';
  const event = { source: parent, origin, data: { type: 'ha-village:state', state: { weather: 'sunny' } } };
  assert.ok(acceptsMessage(event, child, origin));
  assert.equal(acceptsMessage({ ...event, source: {} }, child, origin), false);
  assert.equal(acceptsMessage({ ...event, origin: 'https://other.example' }, child, origin), false);
  assert.equal(acceptsMessage(event, child, null), false);
});

test('entrypoint is self-contained; debug is hidden by default and artwork is under 1 MB', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(/id="debugToggle"[^>]*hidden/.test(html));
  assert.ok(/id="debugPanel"[^>]*hidden/.test(html));
  assert.equal(/class="topbar"|id="weatherLabel"|id="clock"/.test(html), false);
  assert.equal(/https?:\/\//.test(html), false);
  for (const match of html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^"]*)?"/g)) await stat(new URL(`../${match[1]}`, import.meta.url));
  assert.ok((await stat(new URL('../assets/village-church.webp', import.meta.url))).size < 1000000);
});

test('church clock hands use the real minute including the hour hand offset', () => {
  assert.deepEqual(handAngles(0, 0), { hour: 0, minute: 0 });
  assert.ok(Math.abs(handAngles(15, 30).minute - Math.PI) < 1e-12);
  assert.equal(handAngles(15, 30).hour, 3.5 * Math.PI / 6);
  assert.deepEqual(handAngles(12, 0), handAngles(0, 0));
});

test('appointments trigger only at their civil minute, once daily, independently of debug', () => {
  const schedule = new VillageAppointments();
  for (const event of APPOINTMENTS) {
    const time = { dayKey: '2026-9-6', hour: event.hour, minute: event.minute, forced: false };
    assert.equal(schedule.read({ ...time, forced: true }), null);
    assert.equal(schedule.read(time).id, event.id);
    assert.equal(schedule.read(time), null);
  }
  assert.equal(schedule.read({ dayKey: '2026-9-6', hour: 12, minute: 5 }), null);
  assert.equal(schedule.read({ dayKey: '2026-9-7', hour: 12, minute: 0 }).id, 'noon');
});

test('night appointment wakes lantern carriers and releases them to their homes afterward', () => {
  const life = new VillageLife();
  life.setEnvironment({ period: 'night', weather: 'sunny' }, true);
  life.startAppointment(APPOINTMENTS[2]);
  assert.equal(life.residents.filter(v => v.lantern && !v.hidden).length, 7);
  for (let i = 0; i < 3300; i++) life.update(1 / 30);
  assert.equal(life.scheduled, null);
  assert.equal(life.residents.some(v => v.lantern), false);
  for (let i = 0; i < 9000; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => v.hidden).length, 21);
});

test('each lunch service has eight distinct seats; residents eat on arrival and leave after lunch', () => {
  const life = new VillageLife();
  for (const minute of [725, 765, 805]) {
    const diners = life.residents.filter(v => dailyPlan(v, minute).kind === 'meal');
    assert.equal(diners.length, 8);
    assert.equal(new Set(diners.map(v => dailyPlan(v, minute).target)).size, 8);
  }
  life.setClock({ hour: 13, minute: 0 });
  for (let i = 0; i < 9000; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => v.activity === 'meal').length, 8);
  for (const v of life.residents.filter(v => v.activity === 'meal')) {
    assert.equal(v.node, `seat${v.id % 8}`); assert.equal(v.route.length, 0);
  }
  life.setClock({ hour: 14, minute: 0 });
  assert.equal(life.residents.filter(v => v.activity === 'meal').length, 0);
});

test('rain sends lunch indoors without umbrellas; clearing rain brings diners back outside', async () => {
  const life = new VillageLife(); life.setEnvironment({ period: 'day', weather: 'rainy' }); life.setClock({ hour: 13, minute: 0 });
  for (let i = 0; i < 9000; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => v.activity === 'meal' && v.hidden && v.node === 'inn').length, 8);
  life.setEnvironment({ period: 'day', weather: 'sunny' });
  for (let i = 0; i < 4500; i++) life.update(1 / 30);
  assert.equal(life.residents.filter(v => v.activity === 'meal' && !v.hidden).length, 8);
  const source = await readFile(new URL('../entities.js', import.meta.url), 'utf8');
  assert.ok(!source.includes("ctx.arc(0, -23, 15"));
});

test('conversations require two nearby idle residents, not a lone walker', () => {
  const life = new VillageLife(); life.residents.forEach(v => { v.hidden = true; });
  const [a, b] = life.residents;
  Object.assign(a, { hidden: false, x: 600, y: 350, activity: 'rest' });
  Object.assign(b, { hidden: false, x: 625, y: 350, activity: 'rest' });
  life.startConversation();
  assert.equal(a.activity, 'chat'); assert.equal(b.activity, 'chat');
  assert.equal(a.facing, 'right'); assert.equal(b.facing, 'left');
});

test('activity rounds reserve distinct spots and keep rendered positions outside solid geometry', () => {
  const life = new VillageLife();
  const observed = new Set();
  assert.equal(new Set(life.residents.map(v => `${v.x},${v.y}`)).size, 24);
  for (let i = 0; i < 12000; i++) {
    life.update(1 / 30);
    for (const v of life.residents) {
      if (v.hidden) continue;
      assert.ok(walkable(v.x + v.offsetX, v.y + v.offsetY), `${v.name} enters solid geometry`);
      if (!v.route.length) observed.add(v.activity);
    }
    if (i % 30 === 0) {
      const destinations = life.residents.filter(v => !v.hidden && ACTIVITY_SPOTS[v.destination]).map(v => v.destination);
      assert.equal(new Set(destinations).size, destinations.length, 'activity reservation conflict');
    }
  }
  for (const icon of ['fish', 'book', 'music', 'water', 'grain', 'tools', 'broom', 'parcel']) assert.ok(observed.has(icon), `${icon} never happened`);
});

test('specific debug hours remain independent from HA and Auto restores the running clock', () => {
  let now = Date.parse('2026-09-07T16:32:00Z'); const clock = new VillageClock(() => now);
  clock.setExternal({ timeZone: 'UTC' }); const weather = new VillageWeather();
  const initial = weather.read(clock.read());
  assert.equal(clock.forceTime(10), true); assert.equal(clock.read().clock, '10:00');
  assert.equal(clock.forceTime(25), false); assert.equal(clock.read().clock, '10:00');
  assert.deepEqual(weather.read(clock.read()), initial);
  now += 60000; clock.force(null); assert.equal(clock.read().clock, '16:33');
});
