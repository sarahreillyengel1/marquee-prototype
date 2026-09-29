// Booking engine — shared by the API, the builder and the profile.
//
// A person opens times on the dates they choose, in their own timezone. A visitor sees them in the
// visitor's timezone, picks one, and (when the offer has a price and payments are
// connected) pays at booking. Marquee keeps 8%; Stripe's processing fee comes out of that.

export const FEE_RATE = 0.08;
export const PENDING_HOLD_MIN = 35; // an unpaid checkout holds its slot this long

// Availability is set date by date: on a given day a person can open one time range or
// several (say 9–11 and 2–4). There is no fixed weekly pattern.
export type Range = { start: string; end: string };      // "09:00" – "11:00", in the owner's timezone
export type Dates = Record<string, Range[]>;             // "2026-10-02" → its open ranges

export interface BookingSettings {
  timezone: string;
  dates: Dates;
  meeting_link: string;   // the person's own Google Meet (or Zoom) link
  notice_hours: number;   // how soon someone can book
  buffer_min: number;     // breathing room around each booking
}

// People choose their own dates, so the default notice is short: a time opened for tomorrow morning should be bookable today.
export const BLANK_SETTINGS: BookingSettings = { timezone: "America/New_York", dates: {}, meeting_link: "", notice_hours: 2, buffer_min: 0 };

export const validRange = (r?: Range | null) => !!r && /^\d\d:\d\d$/.test(r.start) && /^\d\d:\d\d$/.test(r.end) && r.start < r.end;
/** Ranges on one day, in order, with overlaps joined ("09:00–11:00" + "10:00–12:00" → "09:00–12:00"). */
export function tidyRanges(list: Range[]): Range[] {
  const out: Range[] = [];
  for (const r of list.filter(validRange).sort((a, b) => a.start.localeCompare(b.start))) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) last.end = r.end > last.end ? r.end : last.end;
    else out.push({ ...r });
  }
  return out;
}
/** Is any part of this time still bookable, given how much notice the person asks for? */
export const bookableRange = (date: string, r: Range, tz: string, noticeHours: number, now = new Date()) =>
  validRange(r) && zonedToUtc(date, r.end, validTz(tz) ? tz : "America/New_York").getTime() > now.getTime() + Math.max(0, noticeHours) * 3600_000;

/** Does the person have any open time from today on? */
export const hasHours = (dates?: Dates | null, today = new Date().toISOString().slice(0, 10)) =>
  !!dates && Object.entries(dates).some(([d, list]) => d >= today && (list || []).some(validRange));

/** "60 minutes", "1 hour", "1.5 hours", "45 min" → minutes. Falls back to 30. */
export function parseMinutes(s?: string | null): number {
  const m = (s || "").toLowerCase().match(/([\d.]+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)?/);
  if (!m) return 30;
  const n = parseFloat(m[1]);
  if (!isFinite(n) || n <= 0) return 30;
  const mins = m[2] && m[2].startsWith("h") ? n * 60 : n;
  return Math.min(480, Math.max(10, Math.round(mins)));
}

/** "$150 per session", "$$150", "1,200" → cents. 0 when there is no price. */
export function parsePriceCents(s?: string | null): number {
  const m = (s || "").replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]) * 100);
}
/** A shorter or longer session priced in proportion to the main one, rounded to the nearest $5. */
export const SESSION_LENGTHS = [15, 20, 30, 45, 60, 90];
export function proRataDollars(baseDollars: number, baseMin: number, min: number): number {
  if (!(baseDollars > 0) || !(baseMin > 0)) return 0;
  return Math.max(5, Math.round((baseDollars * min) / baseMin / 5) * 5);
}
export const feeCents = (priceCents: number) => Math.round(priceCents * FEE_RATE);
export const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

/* ── timezones, without a library ── */
function tzOffsetMs(utc: Date, tz: string): number {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p: Record<string, string> = {};
  for (const x of f.formatToParts(utc)) p[x.type] = x.value;
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utc.getTime();
}
/** A wall-clock time in a timezone ("2026-10-02", "09:00", "America/New_York") → the real instant. */
export function zonedToUtc(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - tzOffsetMs(new Date(guess), tz);
  t = guess - tzOffsetMs(new Date(t), tz); // second pass settles daylight-saving edges
  return new Date(t);
}
/** The calendar date ("2026-10-02") an instant falls on in a timezone. */
export const dateInTz = (at: Date, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
export const validTz = (tz?: string | null) => { try { new Intl.DateTimeFormat("en-US", { timeZone: tz || "" }); return !!tz; } catch { return false; } };

export type Busy = { start: number; end: number }; // ms
export type SlotDay = { date: string; slots: string[] }; // date in the OWNER's timezone; slots are ISO instants

/** Every open start time: the person's chosen dates and hours, minus what is already booked. */
export function computeSlots(s: BookingSettings, durationMin: number, busy: Busy[], now = new Date()): SlotDay[] {
  const tz = validTz(s.timezone) ? s.timezone : "America/New_York";
  const earliest = now.getTime() + Math.max(0, s.notice_hours) * 3600_000;
  const dur = durationMin * 60_000, buf = Math.max(0, s.buffer_min) * 60_000;
  const today = dateInTz(now, tz);
  const out: SlotDay[] = [];
  for (const date of Object.keys(s.dates || {}).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d) && d >= today).sort()) {
    const slots: string[] = [];
    for (const r of tidyRanges(s.dates[date] || [])) {
      const open = zonedToUtc(date, r.start, tz).getTime();
      const close = zonedToUtc(date, r.end, tz).getTime();
      for (let t = open; t + dur <= close; t += dur) {
        if (t < earliest) continue;
        if (busy.some((b) => t < b.end + buf && t + dur > b.start - buf)) continue;
        slots.push(new Date(t).toISOString());
      }
    }
    if (slots.length) out.push({ date, slots });
  }
  return out;
}

/* ── calendar invite (.ics) — works in Google, Outlook and Apple without connecting anything ── */
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (t: string) => t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
export function buildIcs(o: { id: string; title: string; description: string; location: string; start: Date; end: Date; organizerName: string; organizerEmail: string; attendeeName: string; attendeeEmail: string; cancelled?: boolean }) {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Marquee//Booking//EN", "CALSCALE:GREGORIAN", `METHOD:${o.cancelled ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT", `UID:${o.id}@marquee.bio`, `SEQUENCE:${o.cancelled ? 1 : 0}`, `STATUS:${o.cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(o.start)}`, `DTEND:${icsDate(o.end)}`,
    `SUMMARY:${icsText(o.title)}`, `DESCRIPTION:${icsText(o.description)}`, `LOCATION:${icsText(o.location)}`,
    `ORGANIZER;CN=${icsText(o.organizerName)}:mailto:${o.organizerEmail}`,
    `ATTENDEE;CN=${icsText(o.attendeeName)};RSVP=TRUE:mailto:${o.attendeeEmail}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

/** "Thursday, October 2 · 10:00 – 11:00 AM EDT" */
export function whenLabel(startIso: string, endIso: string, tz: string) {
  const zone = validTz(tz) ? tz : "UTC";
  const s = new Date(startIso), e = new Date(endIso);
  const day = new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long", month: "long", day: "numeric" }).format(s);
  const t = (d: Date, withZone: boolean) => new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", ...(withZone ? { timeZoneName: "short" } : {}) }).format(d);
  return `${day} · ${t(s, false)} – ${t(e, true)}`;
}
