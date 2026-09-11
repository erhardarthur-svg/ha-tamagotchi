/** Event choreography reuses the path graph: walk, arrive, act, then resume the daily routine. */
const step = (node, activity = 'rest', seconds = 18, extras = {}) => ({ node, activity, seconds, ...extras });
const gather = i => `gather${i % 18}`;
export const EVENT_JOBS = Object.freeze({
  delivery: ['livraison'], garden: ['jardinage'], cleanup: ['entretien'], repair: ['artisanat', 'livraison'],
  fishing: ['peche'], games: ['enfant'], snowball: ['enfant'], flowers: ['jardinage'],
  music: ['musique'], story: ['lecture', 'enfant'], market: ['livraison', 'jardinage'],
  harvest: ['jardinage', 'livraison'], lanterns: ['garde'], stargazing: ['garde'], exchange: ['livraison'],
});
export function outingFor(event, resident, i) {
  const home = step(resident.home, 'rest', 2);
  switch (event.kind) {
    case 'delivery': return [step('workshop', 'parcel', 6, { carry: true }), step(i % 2 ? 'inn' : 'home', 'parcel', 10, { carry: false }), home];
    case 'garden': return [step(['gardenGuestA', 'gardenGuestB', 'feedingGuest', 'garden'][i % 4], ['water', 'leaf', 'grain', 'leaf'][i % 4], 48, { facing: 'left' }), home];
    case 'cleanup': return [step(gather(i * 3), 'broom', 26), step(gather(i * 3 + 1), 'broom', 24), home];
    case 'repair': return [step(i % 2 ? 'repairGuestB' : 'repairGuestA', i < 2 ? 'tools' : 'parcel', 55, { facing: 'up' }), home];
    case 'fishing': return [step(i === 0 ? 'fishGuest' : i === 1 ? 'riverBank' : 'bridgeWest', i === 0 ? 'fish' : 'chat', 60, { facing: 'right' }), home];
    case 'games': case 'snowball': return [step(i === 0 ? 'playA' : i === 1 ? 'playB' : gather(i + 9), i < 2 ? 'play' : 'heart', 75, { facing: i === 0 ? 'right' : 'left' }), home];
    case 'flowers': return [step(i % 2 ? 'gardenGuestA' : 'gardenGuestB', 'leaf', 12, { facing: 'left' }), step(gather(i + 4), 'flower', 45), home];
    case 'music': return [step(i === 0 ? 'stageMusic' : gather(i + 4), i === 0 ? 'music' : 'dance', 90, { facing: i === 0 ? 'down' : 'up' }), home];
    case 'story': return [step(i === 0 ? 'stageMusic' : gather(i + 2), i === 0 ? 'book' : 'heart', 65, { facing: i === 0 ? 'down' : 'up', seated: i > 0 }), home];
    case 'supper': return [step(`seat${i}`, 'meal', 70, { facing: i % 2 ? 'left' : 'right' }), home];
    case 'market': {
      if (i < 2) return [step(i ? 'marketEastSeller' : 'marketWestSeller', 'trade', 110, { facing: 'left' }), home];
      return [step(i % 2 ? 'marketWestBuyer' : 'marketEastBuyer', 'trade', 13 + i * 2, { carry: true, facing: 'up' }), step(gather(i), 'parcel', 14), home];
    }
    case 'picnic': return [step(i < 3 ? ['picnicA', 'picnicB', 'picnicC'][i] : gather(i + 8), 'meal', 75, { seated: true, facing: i % 2 ? 'left' : 'right' }), home];
    case 'lanterns': return [0, 1, 2, 3, 4].map(n => step(['innLane', 'west', 'south', 'east', 'bridgeWest'][(n + i) % 5], 'rest', 5, { lantern: true }));
    case 'stargazing': return [step(['south', 'exchangeA', 'exchangeB'][i % 3], 'star', 55, { facing: 'up', lantern: true }), home];
    case 'parade': return [step(gather(i), 'flag', 10), step('east', 'flag', 4), step('bridgeWest', 'flag', 5), step('south', 'dance', 15), home];
    case 'harvest': return [step(i % 2 ? 'gardenGuestA' : 'gardenGuestB', 'leaf', 12, { carry: true, facing: 'left' }), step(gather(i + 4), 'meal', 45, { carry: false, seated: true }), home];
    case 'gifts': return [step('workshop', 'gift', 7, { carry: true }), step(i % 2 ? 'inn' : 'home', 'gift', 12, { carry: false }), step(gather(i + 4), 'heart', 25), home];
    case 'halloween': return [step('home', 'candy', 12), step('inn', 'candy', 12), step(gather(i + 4), 'candy', 40, { lantern: true }), home];
    case 'celebration': return [step(gather(i + 3), 'dance', 85, { lantern: true }), home];
    case 'exchange': return [step(i ? 'exchangeB' : 'exchangeA', 'chat', 75, { facing: i ? 'left' : 'right', carry: i === 0 }), home];
    case 'birds': return [step(i ? 'exchangeB' : 'exchangeA', 'heart', 25, { facing: 'up' }), home];
    default: return [step(gather(i), 'chat', 30), home];
  }
}
