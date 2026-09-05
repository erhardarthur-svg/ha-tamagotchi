/** All coordinates refer to the 1536 × 1024 background. Keep art and map together. */
export const WORLD = Object.freeze({ width: 1536, height: 1024 });
export const FOUNTAIN = Object.freeze({ x: 711, y: 443, radius: 40 });
export const CHIMNEYS = [[462, 103], [908, 143], [394, 548], [944, 613]];
export const LANTERNS = [
  { x: 488, y: 364, ground: 400 }, { x: 928, y: 509, ground: 539 },
  { x: 624, y: 596, ground: 638 }, { x: 1153, y: 392, ground: 433 },
  { x: 1434, y: 415, ground: 455 },
];
export const WINDOWS = [
  { x: 319, y: 279, w: 10, h: 12 }, { x: 346, y: 277, w: 10, h: 12 },
  { x: 400, y: 240, w: 11, h: 13 }, { x: 505, y: 236, w: 9, h: 12 },
  { x: 497, y: 277, w: 10, h: 13 }, { x: 527, y: 276, w: 11, h: 13 },
  { x: 819, y: 259, w: 12, h: 12 }, { x: 927, y: 267, w: 10, h: 12 },
  { x: 349, y: 649, w: 10, h: 10 }, { x: 453, y: 648, w: 9, h: 12 },
  { x: 958, y: 718, w: 8, h: 11 }, { x: 122, y: 750, w: 7, h: 10 },
];

// A small explicit navigation graph is cheaper and more reliable than free roaming.
// The fountain is surrounded by a ring. The only river crossing is the bridge.
export const NODES = Object.freeze({
  westGate: [12, 467], westPath: [226, 465], westLane: [431, 462],
  west: [561, 448], northwest: [594, 354], north: [703, 335],
  northeast: [811, 350], east: [833, 447], southeast: [793, 527],
  south: [706, 564], southwest: [595, 536],
  northPath: [683, 231], northGate: [676, 16],
  innLane: [488, 349], innStep: [407, 334], inn: [407, 312],
  cottageStep: [875, 324], cottage: [875, 291],
  southLane: [685, 686], southPath: [686, 799], southGate: [674, 1008],
  homePath: [582, 783], homeTurn: [514, 737], homeLane: [483, 690], home: [417, 679],
  workshopPath: [785, 774], workshopStep: [859, 790], workshop: [881, 763],
  eastLane: [997, 465], bridgeWest: [1185, 466], bridgeEast: [1394, 466], eastGate: [1521, 466],
  gardenLane: [570, 827], garden: [485, 867],
  meetingA: [719, 355], meetingB: [742, 357], meetingC: [760, 367],
});
const EDGES = [
  ['westGate', 'westPath'], ['westPath', 'westLane'], ['westLane', 'west'],
  ['west', 'northwest'], ['northwest', 'north'], ['north', 'northeast'],
  ['northeast', 'east'], ['east', 'southeast'], ['southeast', 'south'],
  ['south', 'southwest'], ['southwest', 'west'],
  ['north', 'northPath'], ['northPath', 'northGate'],
  ['northwest', 'innLane'], ['innLane', 'innStep'], ['innStep', 'inn'],
  ['northeast', 'cottageStep'], ['cottageStep', 'cottage'],
  ['south', 'southLane'], ['southLane', 'southPath'], ['southPath', 'southGate'],
  ['southPath', 'homePath'], ['homePath', 'homeTurn'], ['homeTurn', 'homeLane'], ['homeLane', 'home'],
  ['southLane', 'workshopPath'], ['workshopPath', 'workshopStep'], ['workshopStep', 'workshop'],
  ['east', 'eastLane'], ['eastLane', 'bridgeWest'], ['bridgeWest', 'bridgeEast'], ['bridgeEast', 'eastGate'],
  ['southPath', 'gardenLane'], ['gardenLane', 'garden'],
  ['north', 'meetingA'], ['meetingA', 'meetingB'], ['meetingB', 'meetingC'],
];
export const GRAPH = Object.fromEntries(Object.keys(NODES).map(id => [id, []]));
for (const [a, b] of EDGES) { GRAPH[a].push(b); GRAPH[b].push(a); }
export function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

/** Dijkstra on 34 nodes; returns waypoints after `from`, including the destination. */
export function findRoute(from, to) {
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
      const cost = costs[current] + distance(NODES[current], NODES[next]);
      if (cost < (costs[next] ?? Infinity)) { costs[next] = cost; previous[next] = current; open.add(next); }
    }
  }
  return [];
}

// Safety geometry also makes regression tests independent of graph construction.
export const SOLID_AREAS = [
  { x: 285, y: 85, w: 286, h: 217 }, { x: 777, y: 107, w: 184, h: 177 },
  { x: 307, y: 517, w: 174, h: 156 }, { x: 795, y: 582, w: 213, h: 175 },
  { x: 94, y: 691, w: 84, h: 103 },
];
