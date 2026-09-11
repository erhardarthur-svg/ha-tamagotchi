/** All coordinates refer to the 1536 × 1024 background. Keep art and map together. */
export const WORLD = Object.freeze({ width: 1536, height: 1024 });
export const FOUNTAIN = Object.freeze({ x: 943, y: 289, radius: 75 });
// Art landmarks are shared by rendering and navigation; keep them in one place.
export const CHURCH = Object.freeze({
  clock: { x: 763.5, y: 352, radius: 34 },
  bell: { x: 752, y: 273, w: 24, h: 30 },
  plaque: { x: 706, y: 391, w: 115, h: 37 },
  doorway: { x: 698, y: 493 },
  hitArea: { x: 683, y: 247, w: 161, h: 202 },
});
export const SQUARE = Object.freeze({ x: 710, y: 544 });
export const MARKET_STALLS = Object.freeze([{ x: 507, y: 441, color: '#a64e4d' }, { x: 990, y: 436, color: '#547d68' }]);
export const CHIMNEYS = [[462, 103], [394, 548], [944, 613]];
export const LANTERNS = [
  { x: 488, y: 364, ground: 400 }, { x: 928, y: 509, ground: 539 },
  { x: 624, y: 596, ground: 638 }, { x: 1153, y: 392, ground: 433 },
  { x: 1434, y: 415, ground: 455 },
];
export const WINDOWS = [
  { x: 319, y: 279, w: 10, h: 12 }, { x: 346, y: 277, w: 10, h: 12 },
  { x: 400, y: 240, w: 11, h: 13 }, { x: 505, y: 236, w: 9, h: 12 },
  { x: 497, y: 277, w: 10, h: 13 }, { x: 527, y: 276, w: 11, h: 13 },
  { x: 349, y: 649, w: 10, h: 10 }, { x: 453, y: 648, w: 9, h: 12 },
  { x: 958, y: 718, w: 8, h: 11 }, { x: 122, y: 750, w: 7, h: 10 },
  { x: 621, y: 411, w: 8, h: 14 }, { x: 657, y: 417, w: 7, h: 18 },
  { x: 698, y: 366, w: 6, h: 13 },
];

// A small explicit navigation graph is cheaper and more reliable than free roaming.
// Paths wrap around the church and fountain. The only river crossing is the bridge.
export const NODES = Object.freeze({
  westGate: [12, 467], westPath: [226, 465], westLane: [431, 462],
  west: [544, 463], northwest: [580, 322], churchWestBack: [583, 249], north: [688, 236],
  churchNorthwest: [704, 196], churchNorth: [705, 125], churchBackEast: [839, 125], churchNortheast: [839, 187],
  northeast: [838, 307], east: [870, 462], southeast: [820, 512],
  south: [708, 574], southwest: [568, 512],
  northPath: [683, 169], northGate: [676, 16],
  innLane: [488, 349], innStep: [407, 334], inn: [407, 312],
  terrace: [278, 345], terraceWest: [216, 345], terraceEast: [279, 345],
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => {
    const y = [239, 262, 300, 323][Math.floor(i / 2)];
    return [`seat${i}`, [i % 2 ? 270 : 232, y]];
  })),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`aisle${i}`, [i % 2 ? 279 : 216, [239, 262, 300, 323][Math.floor(i / 2)]]])),
  churchStep: [698, 513], church: [698, 497],
  cottageStep: [875, 202], cottage: [917, 192],
  fountainEast: [1036, 289], fountainSoutheast: [1037, 389], fountainSouth: [948, 389], fountainNorth: [978, 191],
  southLane: [685, 686], southPath: [686, 799], southGate: [674, 1008],
  homePath: [582, 783], homeTurn: [514, 737], homeLane: [483, 690], home: [417, 679],
  workshopPath: [785, 774], workshopStep: [859, 790], workshop: [881, 763],
  eastLane: [997, 465], bridgeWest: [1185, 466], bridgeEast: [1394, 466], eastGate: [1521, 466],
  gardenLane: [570, 827], garden: [485, 867],
  gardenWorkA: [484, 807], gardenWorkB: [484, 754],
  feeding: [300, 889], feedingLane: [470, 890],
  benchA: [845, 570], benchB: [872, 570],
  riverBank: [1155, 528], fishing: [1167, 549],
  musicSpot: [771, 516], listenerA: [790, 544], listenerB: [763, 550],
  smithA: [875, 785], smithB: [903, 785],
  wellA: [849, 301], wellB: [909, 389],
  chatA: [575, 573], chatB: [601, 573],
  meetingA: [652, 535], meetingB: [679, 535], meetingC: [706, 535],
  marketWestBuyer: [509, 462], marketWestSeller: [546, 442],
  marketEastBuyer: [991, 458], marketEastSeller: [1030, 442],
  picnicA: [493, 506], picnicB: [520, 514], picnicC: [539, 498],
  exchangeA: [646, 557], exchangeB: [675, 557],
  playA: [637, 518], playB: [787, 563], stageMusic: [745, 512],
  gardenGuestA: [505, 803], gardenGuestB: [507, 755], feedingGuest: [325, 905],
  repairGuestA: [923, 786], repairGuestB: [947, 797], fishGuest: [1171, 580],
  ...Object.fromEntries(Array.from({ length: 18 }, (_, i) => {
    const row = Math.floor(i / 6), column = i % 6;
    return [`gather${i}`, [618 + column * 35 + (row % 2) * 7, 519 + row * 23]];
  })),
});
const EDGES = [
  ['westGate', 'westPath'], ['westPath', 'westLane'], ['westLane', 'west'],
  ['west', 'northwest'], ['northwest', 'churchWestBack'], ['churchWestBack', 'north'], ['north', 'churchNorthwest'],
  ['churchNorthwest', 'churchNorth'], ['churchNorth', 'churchBackEast'], ['churchBackEast', 'churchNortheast'], ['churchNortheast', 'northeast'],
  ['northeast', 'east'], ['east', 'southeast'], ['southeast', 'south'],
  ['south', 'southwest'], ['southwest', 'west'],
  ['north', 'northPath'], ['northPath', 'northGate'],
  ['northwest', 'innLane'], ['innLane', 'innStep'], ['innStep', 'inn'],
  ['innStep', 'terrace'], ['terrace', 'terraceWest'], ['terrace', 'terraceEast'],
  ['churchNortheast', 'cottageStep'], ['cottageStep', 'cottage'],
  ['cottage', 'fountainNorth'], ['fountainNorth', 'fountainEast'],
  ['fountainEast', 'fountainSoutheast'], ['fountainSoutheast', 'fountainSouth'], ['fountainSouth', 'east'],
  ['south', 'churchStep'], ['churchStep', 'church'],
  ['south', 'southLane'], ['southLane', 'southPath'], ['southPath', 'southGate'],
  ['southPath', 'homePath'], ['homePath', 'homeTurn'], ['homeTurn', 'homeLane'], ['homeLane', 'home'],
  ['southLane', 'workshopPath'], ['workshopPath', 'workshopStep'], ['workshopStep', 'workshop'],
  ['east', 'eastLane'], ['eastLane', 'bridgeWest'], ['bridgeWest', 'bridgeEast'], ['bridgeEast', 'eastGate'],
  ['southPath', 'gardenLane'], ['gardenLane', 'garden'],
  ['garden', 'gardenWorkA'], ['gardenWorkA', 'gardenWorkB'],
  ['garden', 'feedingLane'], ['feedingLane', 'feeding'],
  ['southeast', 'benchA'], ['benchA', 'benchB'],
  ['bridgeWest', 'riverBank'], ['riverBank', 'fishing'],
  ['southeast', 'musicSpot'], ['musicSpot', 'listenerA'], ['listenerA', 'listenerB'],
  ['workshopStep', 'smithA'], ['smithA', 'smithB'],
  ['northeast', 'wellA'], ['fountainSouth', 'wellB'],
  ['southwest', 'chatA'], ['chatA', 'chatB'], ['chatB', 'south'],
  ['churchStep', 'meetingA'], ['meetingA', 'meetingB'], ['meetingB', 'meetingC'],
  ['west', 'marketWestBuyer'], ['west', 'marketWestSeller'],
  ['eastLane', 'marketEastBuyer'], ['eastLane', 'marketEastSeller'],
  ['west', 'picnicA'], ['picnicA', 'picnicB'], ['picnicB', 'picnicC'], ['picnicC', 'southwest'],
  ['south', 'exchangeA'], ['exchangeA', 'exchangeB'],
  ['churchStep', 'playA'], ['southeast', 'playB'], ['churchStep', 'stageMusic'],
  ['garden', 'gardenGuestA'], ['gardenGuestA', 'gardenGuestB'], ['feedingLane', 'feedingGuest'],
  ['workshopStep', 'repairGuestA'], ['repairGuestA', 'repairGuestB'], ['fishing', 'fishGuest'],
];
for (let i = 0; i < 8; i++) {
  EDGES.push([`aisle${i}`, `seat${i}`]);
  EDGES.push([`aisle${i}`, i < 6 ? `aisle${i + 2}` : i % 2 ? 'terraceEast' : 'terraceWest']);
}
const ring = ['southeast', 'south', 'southwest', 'churchStep'];
for (let i = 0; i < 18; i++) {
  const point = NODES[`gather${i}`];
  const anchor = ring.reduce((a, b) => distance(NODES[a], point) < distance(NODES[b], point) ? a : b);
  EDGES.push([anchor, `gather${i}`]);
}
export const GRAPH = Object.fromEntries(Object.keys(NODES).map(id => [id, []]));
for (const [a, b] of EDGES) { GRAPH[a].push(b); GRAPH[b].push(a); }
export function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

/** Dijkstra on the small footpath graph, with optional soft congestion costs. */
export function findRoute(from, to, occupancy = {}) {
  if (!NODES[from] || !NODES[to] || from === to) return [];
  const costs = { [from]: 0 }, previous = {}, open = new Set([from]);
  while (open.size) {
    const current = [...open].reduce((a, b) => costs[a] < costs[b] ? a : b);
    open.delete(current);
    if (current === to) {
      const path = [];
      for (let node = to; node !== from; node = previous[node]) path.unshift(node);
      return path;
    }
    for (const next of GRAPH[current]) {
      const cost = costs[current] + distance(NODES[current], NODES[next]) + (occupancy[next] || 0) * 9;
      if (cost < (costs[next] ?? Infinity)) { costs[next] = cost; previous[next] = current; open.add(next); }
    }
  }
  return [];
}

// Safety geometry also makes regression tests independent of graph construction.
export const SOLID_AREAS = [
  { x: 285, y: 85, w: 286, h: 217 },
  // Projected roofs are solid too: sprites never walk over the church artwork.
  { x: 594, y: 267, w: 218, h: 229 }, { x: 721, y: 151, w: 91, h: 116 },
  { x: 307, y: 517, w: 174, h: 156 }, { x: 795, y: 582, w: 213, h: 175 },
  { x: 94, y: 691, w: 84, h: 103 },
];
