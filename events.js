/** Civil-time appointments: no replay of missed hours, once per village day. */
export const APPOINTMENTS = Object.freeze([
  { id: 'noon', hour: 12, minute: 0, count: 14, duration: 110, text: 'Midi sonne au clocher. Les habitants se retrouvent sur la place.' },
  { id: 'afternoon', hour: 16, minute: 20, count: 18, duration: 120, text: '16 h 20 : une pause, quelques pas de danse… le village se détend.' },
  { id: 'night', hour: 4, minute: 20, count: 7, duration: 100, text: '4 h 20 : les lanternes des lève-tôt traversent le village.' },
]);
export class VillageAppointments {
  constructor() { this.day = null; this.seen = new Set(); }
  read(time) {
    if (time.forced) return null;
    if (this.day !== time.dayKey) { this.day = time.dayKey; this.seen.clear(); }
    const event = APPOINTMENTS.find(e => e.hour === time.hour && e.minute === time.minute);
    if (!event || this.seen.has(event.id)) return null;
    this.seen.add(event.id); return event;
  }
}
