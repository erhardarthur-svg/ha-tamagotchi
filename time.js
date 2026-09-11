/** The clock always runs. A supplied HA date is an anchor, never a frozen clock. */
export const PERIODS = Object.freeze({ morning: 'Matin', day: 'Jour', evening: 'Soir', night: 'Nuit' });
export const PREVIEW_HOURS = Object.freeze({ morning: 7, day: 13, evening: 19, night: 1 });
export function periodForHour(hour) {
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}
export function validDate(value) {
  if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
export function validTimezone(value) {
  if (typeof value !== 'string') return false;
  try { new Intl.DateTimeFormat('fr-FR', { timeZone: value }).format(); return true; }
  catch { return false; }
}
export class VillageClock {
  constructor(now = () => Date.now()) {
    this.now = now; this.offset = 0; this.timeZone = undefined; this.forcedPeriod = null; this.forcedTime = null; this.forcedDate = null;
    this.setFormatters();
  }
  setFormatters() {
    const options = this.timeZone ? { timeZone: this.timeZone } : {};
    this.partsFormatter = new Intl.DateTimeFormat('en-GB', { ...options, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    this.dateFormatter = new Intl.DateTimeFormat('fr-FR', { ...options, weekday: 'short', day: 'numeric', month: 'short' });
  }
  setExternal({ datetime, timeZone } = {}) {
    const date = validDate(datetime);
    if (date) this.offset = date.getTime() - this.now();
    if (validTimezone(timeZone)) { this.timeZone = timeZone; this.setFormatters(); }
  }
  resetExternal() { this.offset = 0; this.timeZone = undefined; this.setFormatters(); }
  force(period) { this.forcedTime = null; this.forcedPeriod = Object.prototype.hasOwnProperty.call(PERIODS, period) ? period : null; }
  forceTime(hour, minute = 0) {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) return false;
    this.forcedTime = { hour, minute }; this.forcedPeriod = periodForHour(hour); return true;
  }
  forceDate(value) {
    if (value === null) { this.forcedDate = null; return true; }
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    if (year < 1900 || year > 9999 || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return false;
    this.forcedDate = { year, month, day }; return true;
  }
  read() {
    const date = new Date(this.now() + this.offset);
    const parts = Object.fromEntries(this.partsFormatter.formatToParts(date).map(p => [p.type, p.value]));
    const hour = this.forcedTime?.hour ?? (this.forcedPeriod ? PREVIEW_HOURS[this.forcedPeriod] : Number(parts.hour));
    const minute = this.forcedTime?.minute ?? (this.forcedPeriod ? 0 : Number(parts.minute));
    const { year, month, day } = this.forcedDate || { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
    const civilDate = new Date(Date.UTC(year, month - 1, day, 12));
    return {
      date, hour, minute, localHour: Number(parts.hour), year, month, day, weekday: civilDate.getUTCDay(), dayKey: `${year}-${month}-${day}`,
      inputDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, dateForced: Boolean(this.forcedDate),
      period: this.forcedPeriod || periodForHour(hour),
      clock: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      shortDate: this.forcedDate ? civilDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) : this.dateFormatter.format(date), forced: Boolean(this.forcedPeriod || this.forcedDate),
    };
  }
}
