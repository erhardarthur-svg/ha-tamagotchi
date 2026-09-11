import { NODES, FOUNTAIN, SOLID_AREAS, findRoute } from './world.js?v=4.6';

export function walkable(x, y, margin = 0) {
  return !SOLID_AREAS.some(r => x > r.x - margin && x < r.x + r.w + margin && y > r.y - margin && y < r.y + r.h + margin)
    && Math.hypot(x - FOUNTAIN.x, y - FOUNTAIN.y) > FOUNTAIN.radius + margin
    && (x <= 1190 || Math.abs(y - 466) <= 17 - margin);
}

export function routeTo(entity, target, neighbors = []) {
  if (!NODES[target]) return;
  const anchor = entity.route[0] || entity.node;
  const occupancy = {};
  for (const other of neighbors) if (other !== entity && !other.hidden && other.route[0]) occupancy[other.route[0]] = (occupancy[other.route[0]] || 0) + 1;
  entity.route = [...(entity.route.length ? [anchor] : []), ...findRoute(anchor, target, occupancy)];
  entity.destination = target; entity.wait = 0; entity.activity = 'walk'; entity.socialUntil = 0;
  entity.partner = null; entity.arrived = false;
}

/** Stable pace, braking at corners, smooth right-hand lanes and bounded following. */
export function walk(entity, dt, speed, neighbors = []) {
  entity.moving = false;
  if (!entity.route.length) return;
  const point = NODES[entity.route[0]], dx = point[0] - entity.x, dy = point[1] - entity.y;
  const length = Math.hypot(dx, dy), ux = dx / (length || 1), uy = dy / (length || 1);
  let target = entity.route.length === 1 ? Math.min(speed, Math.sqrt(90 * length)) : speed;
  if (entity.route.length > 1 && length < 20) {
    const next = NODES[entity.route[1]], nx = next[0] - point[0], ny = next[1] - point[1];
    const turn = (ux * nx + uy * ny) / (Math.hypot(nx, ny) || 1);
    target *= .6 + .4 * Math.max(0, turn);
  }
  let following = 1;
  for (const other of neighbors) {
    if (other === entity || other.hidden || !other.route.length) continue;
    const ox = other.x - entity.x, oy = other.y - entity.y, ahead = ox * ux + oy * uy;
    if (other.facing === entity.facing && ahead > .5 && ahead < 27 && Math.abs(ox * uy - oy * ux) < 10) following = Math.min(following, Math.max(.3, (ahead - 6) / 21));
  }
  target *= following; // Do not multiply one slowdown per neighbour: crowds must keep moving.
  entity.velocity += Math.max(-85 * dt, Math.min(48 * dt, target - entity.velocity));
  const step = Math.min(length, Math.max(0, entity.velocity * dt));
  const narrow = /^(aisle|seat|terrace)/.test(entity.route[0]) || /^(aisle|seat|terrace)/.test(entity.node);
  const width = narrow ? 0 : 6 + (entity.id || 0) % 3 * .6;
  let tx = -uy * width, ty = ux * width;
  if (!walkable(entity.x + tx, entity.y + ty, 3)) { tx = 0; ty = 0; }
  entity.offsetX += (tx - entity.offsetX) * Math.min(1, dt * 3);
  entity.offsetY += (ty - entity.offsetY) * Math.min(1, dt * 3);
  if (length <= step) { entity.x = point[0]; entity.y = point[1]; entity.node = entity.route.shift(); }
  else if (length) { entity.x += ux * step; entity.y += uy * step; }
  entity.moving = step > .01; entity.walk += step;
  if (!entity.route.length) { entity.velocity = 0; entity.arrived = true; }
  // Hysteresis avoids rapid left/up flicker on diagonal paths.
  if (Math.abs(dx) > Math.abs(dy) * 1.15) entity.facing = dx > 0 ? 'right' : 'left';
  else if (Math.abs(dy) > Math.abs(dx) * 1.15) entity.facing = dy > 0 ? 'down' : 'up';
  if (!walkable(entity.x + entity.offsetX, entity.y + entity.offsetY)) { entity.offsetX = 0; entity.offsetY = 0; }
}
