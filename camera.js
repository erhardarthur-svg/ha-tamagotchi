import { WORLD, CHURCH } from './world.js?v=4.5';

/** One reversible focus gesture, with the same coordinates for drawing and touch. */
export class VillageCamera {
  constructor() { this.focus = 0; this.focused = false; this.resize(WORLD.width, WORLD.height); }
  resize(width, height) { this.width = width; this.height = height; this.compose(); }
  setFocused(focused, immediate = false) {
    this.focused = Boolean(focused);
    if (immediate) this.focus = Number(this.focused);
    this.compose();
  }
  update(dt, reducedMotion = false) {
    const target = Number(this.focused);
    this.focus += (target - this.focus) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 9));
    if (Math.abs(target - this.focus) < .001) this.focus = target;
    this.compose();
  }
  compose() {
    this.scale = Math.max(this.width / WORLD.width, this.height / WORLD.height) * (1 + this.focus * 1.45);
    const cx = WORLD.width / 2 + (CHURCH.clock.x - WORLD.width / 2) * this.focus;
    const cy = WORLD.height / 2 + (CHURCH.clock.y + 40 - WORLD.height / 2) * this.focus;
    // Clamp to the illustration, including very wide HA tiles.
    this.offsetX = Math.max(this.width - WORLD.width * this.scale, Math.min(0, this.width / 2 - cx * this.scale));
    this.offsetY = Math.max(this.height - WORLD.height * this.scale, Math.min(0, this.height / 2 - cy * this.scale));
  }
  worldPoint(x, y) { return { x: (x - this.offsetX) / this.scale, y: (y - this.offsetY) / this.scale }; }
  hitsClock(x, y) {
    const area = CHURCH.hitArea;
    return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
  }
}
