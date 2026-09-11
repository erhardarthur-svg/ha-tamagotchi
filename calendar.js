/** Village traditions, in civil time. These are our village's dates, not an external events feed. */
const daily = [
  { id: 'bread', label: 'La tournée du matin', start: 390, end: 480, kind: 'delivery', count: 4, text: 'Les premières livraisons arrivent à la taverne.' },
  { id: 'garden', label: 'Le jardin se réveille', start: 480, end: 570, kind: 'garden', count: 4, text: 'Arrosoirs et graines : le potager se réveille.' },
  { id: 'care', label: 'Entretien de la place', start: 600, end: 690, kind: 'cleanup', count: 4, text: 'Les voisins prennent soin des allées et de la fontaine.' },
  { id: 'story', label: 'Une histoire sur le parvis', start: 870, end: 930, kind: 'story', count: 5, text: 'Un livre s’ouvre : les enfants viennent écouter une histoire.' },
  { id: 'supper', label: 'Retrouvailles à la taverne', start: 1080, end: 1170, kind: 'supper', count: 6, text: 'À la taverne, on se retrouve autour d’un verre et d’un repas.' },
  { id: 'lamps', label: 'La tournée des lanternes', start: 1230, end: 1290, kind: 'lanterns', count: 3, text: 'Les gardiens font leur tournée avec leurs lanternes.' },
  { id: 'stars', label: 'Les veilleurs regardent les étoiles', start: 1320, end: 1410, kind: 'stargazing', count: 3, clearSky: true, night: true, text: 'Les veilleurs s’arrêtent pour contempler le ciel.' },
];
const weekly = [
  { id: 'repairs', weekday: 1, label: 'Lundi · atelier ouvert', start: 600, end: 710, kind: 'repair', count: 4, text: 'Lundi : les voisins apportent leurs outils à réparer.' },
  { id: 'fishing', weekday: 2, label: 'Mardi · rendez-vous des pêcheurs', start: 900, end: 1020, kind: 'fishing', count: 3, text: 'Mardi : les pêcheurs comparent leurs prises au bord de l’eau.' },
  { id: 'games', weekday: 3, label: 'Mercredi · jeux sur la place', start: 840, end: 960, kind: 'games', count: 4, text: 'Mercredi : une petite partie de ballon commence sur le parvis.' },
  { id: 'flowers', weekday: 4, label: 'Jeudi · les fleurs du village', start: 600, end: 710, kind: 'flowers', count: 4, text: 'Jeudi : on prépare des bouquets pour fleurir le village.' },
  { id: 'music', weekday: 5, label: 'Vendredi · soirée musicale', start: 1080, end: 1230, kind: 'music', count: 8, text: 'Vendredi soir : les musiciens invitent les voisins à danser.' },
  { id: 'market-sat', weekday: 6, label: 'Samedi · marché', start: 540, end: 715, kind: 'market', count: 8, text: 'C’est jour de marché : paniers, légumes et petites emplettes.' },
  { id: 'market-sun', weekday: 0, label: 'Dimanche · petit marché', start: 540, end: 715, kind: 'market', count: 8, text: 'Le petit marché du dimanche anime les allées.' },
  { id: 'picnic', weekday: 0, label: 'Dimanche · pique-nique', start: 840, end: 1020, kind: 'picnic', count: 6, text: 'Dimanche : les voisins partagent un pique-nique près du jardin.' },
];
export const DAILY_TRADITIONS = Object.freeze(daily);
export const WEEKLY_TRADITIONS = Object.freeze(weekly);
export const FESTIVALS = Object.freeze([
  { id: 'newyear', label: 'Bonne année !', month: 1, from: 1, to: 1, kind: 'celebration', count: 10, decor: 'stars', start: 0, end: 1200, night: true, text: 'Bonne année ! Les voisins échangent leurs vœux sur la place.' },
  { id: 'valentine', label: 'La journée des attentions', month: 2, from: 14, to: 14, kind: 'flowers', count: 6, decor: 'hearts', start: 600, end: 1200, text: 'De petits bouquets passent de main en main.' },
  { id: 'spring', label: 'La fête du printemps', month: 3, from: 21, to: 21, kind: 'flowers', count: 6, decor: 'flowers', start: 570, end: 1080, text: 'Le village fête le printemps avec des fleurs et des plantations.' },
  { id: 'mayday', label: 'Des fleurs porte-bonheur', month: 5, from: 1, to: 1, kind: 'flowers', count: 6, decor: 'flowers', start: 540, end: 1080, text: 'Des bouquets porte-bonheur circulent entre voisins.' },
  { id: 'musicday', label: 'La fête de la musique', month: 6, from: 21, to: 21, kind: 'music', count: 10, decor: 'bunting', start: 600, end: 1320, text: 'La fête de la musique remplit le parvis de petites mélodies.' },
  { id: 'july', label: 'La fête de juillet', month: 7, from: 14, to: 14, kind: 'parade', count: 10, decor: 'bunting', start: 600, end: 1380, night: true, text: 'Sous les fanions, une petite parade traverse le village.' },
  { id: 'harvest', label: 'La fête des récoltes', month: 9, from: 22, to: 22, kind: 'harvest', count: 8, decor: 'harvest', start: 540, end: 1140, text: 'Les récoltes arrivent du potager : on prépare un repas à partager.' },
  { id: 'halloween', label: 'Halloween', month: 10, from: 31, to: 31, kind: 'halloween', count: 8, decor: 'pumpkins', start: 960, end: 1380, night: true, text: 'Citrouilles allumées et petites tournées de friandises.' },
  { id: 'winter', label: 'Les préparatifs de Noël', month: 12, from: 15, to: 23, kind: 'gifts', count: 6, decor: 'winter', start: 600, end: 1200, text: 'Rubans, paquets et petites livraisons : Noël se prépare.' },
  { id: 'christmas', label: 'Noël au village', month: 12, from: 24, to: 26, kind: 'gifts', count: 8, decor: 'winter', start: 540, end: 1380, night: true, text: 'Les cadeaux passent de porte en porte, sous les guirlandes.' },
  { id: 'eve', label: 'Le réveillon', month: 12, from: 31, to: 31, kind: 'celebration', count: 10, decor: 'stars', start: 1200, end: 1440, night: true, text: 'Les voisins se rassemblent pour la dernière soirée de l’année.' },
]);
export const RANDOM_SCENES = Object.freeze([
  { id: 'exchange', label: 'Un colis pour un voisin', kind: 'exchange', count: 2, text: 'Deux voisins se retrouvent pour se remettre un colis.' },
  { id: 'helping', label: 'Un coup de main', kind: 'repair', count: 3, text: 'Un voisin vient donner un coup de main à l’atelier.' },
  { id: 'ball', label: 'Une partie improvisée', kind: 'games', count: 4, text: 'Un ballon roule : les enfants improvisent une partie.' },
  { id: 'bouquet', label: 'Une petite attention', kind: 'flowers', count: 2, text: 'Un bouquet et un sourire éclairent la journée.' },
  { id: 'birds', label: 'Un envol sur la place', kind: 'birds', count: 2, duration: 65, text: 'Quelques oiseaux s’envolent au passage des promeneurs.' },
  { id: 'picnic', label: 'Un goûter improvisé', kind: 'picnic', count: 3, text: 'Un panier s’ouvre : on partage un petit goûter.' },
  { id: 'story', label: 'Encore une histoire', kind: 'story', count: 4, text: 'Les enfants réclament encore une petite histoire.' },
  { id: 'snowball', label: 'Bataille de neige', kind: 'snowball', count: 4, weather: 'snowy', text: 'Quelques boules de neige traversent le parvis.' },
  { id: 'stars', label: 'Une étoile filante', kind: 'stargazing', count: 3, night: true, nightOnly: true, clearSky: true, duration: 90, text: 'Une étoile filante passe au-dessus des veilleurs.' },
  { id: 'lanterns', label: 'Une ronde tranquille', kind: 'lanterns', count: 3, night: true, nightOnly: true, text: 'Les lanternes se croisent dans les allées silencieuses.' },
]);
export function seasonForMonth(month) { return ['winter', 'spring', 'summer', 'autumn'][Math.floor(month % 12 / 3)]; }
export function civilDay(time) {
  const fallback = (time?.dayKey || '').split('-').map(Number);
  const year = time?.year ?? fallback[0], month = time?.month ?? fallback[1], day = time?.day ?? fallback[2];
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  return { year, month, day, weekday: new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay() };
}
const within = (event, minute) => minute >= event.start && minute < event.end;
export function calendarFor(time) {
  const date = civilDay(time);
  if (!date) return { season: 'summer', festival: null, market: false, candidates: [], agenda: [] };
  const minute = time.hour * 60 + time.minute;
  const festival = FESTIVALS.find(e => e.month === date.month && date.day >= e.from && date.day <= e.to) || null;
  const week = weekly.filter(e => e.weekday === date.weekday);
  const agenda = [...(festival ? [{ ...festival, cadence: 'annual' }] : []), ...week.map(e => ({ ...e, cadence: 'weekly' })), ...daily.map(e => ({ ...e, cadence: 'daily' }))];
  return { ...date, season: seasonForMonth(date.month), festival,
    market: week.some(e => e.kind === 'market' && within(e, minute)),
    candidates: agenda.filter(e => within(e, minute)), agenda: agenda.sort((a, b) => a.start - b.start),
  };
}
export function sceneAllowed(event, time, weather) {
  if (weather === 'stormy' || weather === 'rainy') return false;
  if (time.hour >= 12 && time.hour < 14) return false; // Lunch and the noon bell stay in charge.
  if (event.weather && event.weather !== weather) return false;
  if (event.clearSky && weather !== 'sunny') return false;
  const night = time.period === 'night' || time.hour < 6 || time.hour >= 22;
  if (event.nightOnly && !night) return false;
  return !night || Boolean(event.night);
}
export const CALENDAR_PREVIEWS = Object.freeze([
  ...daily.map(event => ({ ...event, key: `daily:${event.id}`, group: 'Chaque jour' })),
  ...weekly.map(event => ({ ...event, key: `weekly:${event.id}`, group: 'Chaque semaine' })),
  ...FESTIVALS.map(event => ({ ...event, key: `annual:${event.id}`, group: 'Au fil de l’année' })),
  ...RANDOM_SCENES.map(event => ({ ...event, key: `random:${event.id}`, group: 'Petites surprises' })),
]);
export function previewDate(event, time) {
  const civil = civilDay(time);
  if (!civil) return null;
  let date = new Date(Date.UTC(civil.year, civil.month - 1, civil.day, 12));
  if (event.month) date = new Date(Date.UTC(civil.year, event.month - 1, event.from, 12));
  if (event.weekday !== undefined) date.setUTCDate(date.getUTCDate() + (event.weekday - date.getUTCDay() + 7) % 7);
  let minute = event.start ?? (event.night ? 22 * 60 + 15 : 10 * 60);
  if (event.id === 'halloween') minute = 20 * 60;
  if (event.id === 'christmas') minute = 19 * 60;
  if (event.id === 'eve') minute = 23 * 60 + 58;
  if (event.id === 'july') minute = 22 * 60;
  return { date: date.toISOString().slice(0, 10), hour: Math.floor(minute / 60), minute: minute % 60, weather: event.weather || 'sunny' };
}

/** One calendar vignette at a time, with breathing room and bounded per-day memory. */
export class VillageCalendar {
  constructor() { this.day = null; this.seen = new Map(); this.nextAt = 0; }
  reset() { this.day = null; this.seen.clear(); this.nextAt = 0; }
  read(time, weather, now, busy = false) {
    const calendar = calendarFor(time);
    if (this.day !== time.dayKey) { this.day = time.dayKey; this.seen.clear(); this.nextAt = now + 3; }
    if (busy || now < this.nextAt) return null;
    for (const event of calendar.candidates) {
      if (!sceneAllowed(event, time, weather)) continue;
      const last = this.seen.get(event.id);
      // Annual festivities can recur gently; each daily/weekly scene plays once that day.
      if (last !== undefined && (event.cadence !== 'annual' || now - last < 25 * 60)) continue;
      this.seen.set(event.id, now); this.nextAt = now + 7 * 60;
      return { ...event, source: 'calendar', duration: 185 };
    }
    return null;
  }
}
