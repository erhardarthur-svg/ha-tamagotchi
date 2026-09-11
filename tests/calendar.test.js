import test from 'node:test';
import assert from 'node:assert/strict';
import { VillageClock, periodForHour } from '../time.js';
import { calendarFor, VillageCalendar, CALENDAR_PREVIEWS, FESTIVALS, RANDOM_SCENES, previewDate, sceneAllowed } from '../calendar.js';
import { VillageLife } from '../entities.js';
import { APPOINTMENTS } from '../events.js';
import { walkable } from '../navigation.js';

function civil(year, month, day, hour = 10, minute = 0) {
  return { year, month, day, dayKey: `${year}-${month}-${day}`, hour, minute, period: periodForHour(hour) };
}
function tick(life, seconds, inspect = () => {}) {
  for (let i = 0; i < seconds * 15; i++) { life.update(1 / 15); inspect(); }
}

test('date previews validate leap days and restore the running HA civil date', () => {
  let now = Date.parse('2026-12-31T23:30:00Z');
  const clock = new VillageClock(() => now);
  clock.setExternal({ timeZone: 'Europe/Paris' });
  assert.equal(clock.read().dayKey, '2027-1-1');
  assert.equal(clock.read().weekday, 5);
  assert.ok(clock.forceDate('2028-02-29'));
  assert.equal(clock.read().inputDate, '2028-02-29');
  for (const invalid of ['2027-02-29', '2028-02-30', '0000-01-01', '2026-13-01', 'tomorrow']) assert.equal(clock.forceDate(invalid), false);
  assert.equal(clock.read().inputDate, '2028-02-29');
  clock.forceTime(16, 20); now += 90 * 60000;
  clock.forceDate(null); clock.force(null);
  assert.equal(clock.read().dayKey, '2027-1-1');
  assert.equal(clock.read().clock, '02:00'); assert.equal(clock.read().forced, false);
});

test('weekly and yearly decorations follow civil dates and their exact boundaries', () => {
  assert.ok(calendarFor(civil(2026, 9, 12)).market);
  assert.ok(calendarFor(civil(2026, 9, 13)).market);
  assert.equal(calendarFor(civil(2026, 9, 14)).market, false);
  assert.equal(calendarFor(civil(2026, 9, 12, 11, 55)).market, false);
  assert.equal(calendarFor(civil(2026, 10, 30)).festival, null);
  assert.equal(calendarFor(civil(2026, 10, 31)).festival.id, 'halloween');
  assert.equal(calendarFor(civil(2026, 11, 1)).festival, null);
  assert.equal(calendarFor(civil(2026, 12, 23)).festival.id, 'winter');
  assert.equal(calendarFor(civil(2026, 12, 24)).festival.id, 'christmas');
  assert.equal(calendarFor(civil(2026, 12, 27)).festival, null);
  assert.deepEqual([1, 4, 7, 10].map(month => calendarFor(civil(2026, month, 2)).season), ['winter', 'spring', 'summer', 'autumn']);
  const sunday = CALENDAR_PREVIEWS.find(e => e.id === 'market-sun');
  assert.equal(previewDate(sunday, civil(2026, 12, 31)).date, '2027-01-03');
});

test('calendar gives festivities priority, spaces scenes and does not replay daily activities', () => {
  const calendar = new VillageCalendar(), time = civil(2026, 6, 21, 15);
  assert.equal(calendar.read(time, 'sunny', 0), null);
  assert.equal(calendar.read(time, 'sunny', 4, true), null);
  assert.equal(calendar.read(time, 'sunny', 4).id, 'musicday');
  assert.equal(calendar.read(time, 'sunny', 20), null);
  assert.equal(calendar.read(time, 'sunny', 500).id, 'picnic');
  assert.equal(calendar.read(time, 'sunny', 1000).id, 'story');
  assert.equal(calendar.read(time, 'sunny', 1430), null);
  assert.equal(calendar.read(time, 'sunny', 1600).id, 'musicday');
  calendar.reset();
  assert.equal(calendar.read(civil(2026, 6, 21, 13), 'sunny', 1700), null);
  assert.equal(calendar.read(civil(2026, 6, 21, 13), 'sunny', 1710), null);
  assert.equal(sceneAllowed(FESTIVALS[0], civil(2026, 1, 1, 0), 'stormy'), false);
});

test('every event kind actually acts after arrival and follows safe paths', () => {
  // One representative per choreography, retaining its largest participant count.
  const kinds = new Map();
  for (const event of CALENDAR_PREVIEWS) if (!kinds.has(event.kind) || kinds.get(event.kind).count < event.count) kinds.set(event.kind, event);
  for (const event of kinds.values()) {
    const life = new VillageLife(); life.nextEvent = Infinity;
    const preset = previewDate(event, civil(2026, 9, 11));
    const [year, month, day] = preset.date.split('-').map(Number), time = civil(year, month, day, preset.hour, preset.minute);
    life.setEnvironment({ period: time.period, weather: preset.weather }, true); life.setClock(time);
    assert.ok(life.startHappening({ ...event, duration: 210 }), event.kind);
    const acting = new Set();
    tick(life, 209, () => {
      for (const v of life.residents) {
        if (v.hidden) continue;
        assert.ok(walkable(v.x + v.offsetX, v.y + v.offsetY), `${event.kind}: ${v.name} enters an obstacle`);
        if (v.outing?.acting && !v.route.length) {
          assert.equal(v.node, v.outing.steps[v.outing.index].node, `${event.kind}: activity starts at the wrong place`);
          acting.add(v.id);
        }
      }
    });
    assert.ok(acting.size >= Math.min(2, life.happening.residents.length), `${event.kind}: nobody reaches the activity`);
    life.endHappening();
    assert.ok(life.residents.every(v => !v.outing && !v.seated && !v.costume));
  }
});

test('parcel handover waits for two neighbours to meet before changing hands', () => {
  const life = new VillageLife(); life.nextEvent = Infinity;
  life.startHappening(RANDOM_SCENES.find(e => e.kind === 'exchange'));
  const [sender, recipient] = life.happening.residents.map(id => life.residents[id]);
  assert.ok(sender.carrying && !recipient.carrying);
  tick(life, 90, () => {
    if (life.happening.transferred) assert.ok(!sender.carrying && recipient.carrying);
  });
  assert.ok(life.happening.transferred);
  life.endHappening();
  assert.ok(!sender.carrying && !recipient.carrying);
});

test('rain, lunch and bell appointments release participants without teleporting', () => {
  for (const stop of ['rain', 'lunch', 'bell']) {
    const life = new VillageLife(); life.nextEvent = Infinity;
    life.startHappening(CALENDAR_PREVIEWS.find(e => e.id === 'market-sat'));
    tick(life, 35);
    const before = life.residents.map(v => [v.x, v.y]);
    if (stop === 'rain') life.setEnvironment({ period: 'day', weather: 'rainy' });
    if (stop === 'lunch') life.setClock(civil(2026, 9, 12, 12));
    if (stop === 'bell') life.startAppointment(APPOINTMENTS[0]);
    assert.equal(life.happening, null);
    assert.ok(life.residents.every(v => !v.outing && !v.seated));
    assert.deepEqual(life.residents.map(v => [v.x, v.y]), before);
  }
});

test('night surprises involve only the three watchmen and snowballs need snow', () => {
  const life = new VillageLife(); life.nextEvent = Infinity;
  life.setEnvironment({ period: 'night', weather: 'sunny' }, true); life.setClock(civil(2026, 9, 11, 23));
  const stars = RANDOM_SCENES.find(e => e.kind === 'stargazing');
  assert.ok(life.startHappening(stars));
  assert.deepEqual([...life.happening.residents].sort((a, b) => a - b), [0, 8, 16]);
  assert.equal(life.residents.filter(v => v.hidden).length, 21);
  life.setEnvironment({ period: 'morning', weather: 'sunny' }); life.setClock(civil(2026, 9, 12, 7));
  assert.equal(life.happening, null);
  assert.equal(sceneAllowed(stars, civil(2026, 9, 12, 7), 'sunny'), false);
  const snowball = RANDOM_SCENES.find(e => e.kind === 'snowball');
  assert.equal(sceneAllowed(snowball, civil(2026, 1, 2), 'sunny'), false);
  assert.equal(sceneAllowed(snowball, civil(2026, 1, 2), 'snowy'), true);
});
