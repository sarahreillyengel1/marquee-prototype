"use client";
// Booking and "Send request" forms shown inside the Work with Me pop-up.
// Styles live in profile-design.css under .mq-root (classes bk-*).

import { useEffect, useMemo, useState } from "react";
import { money } from "@/lib/booking";

type SlotDay = { date: string; slots: string[] };
type Session = { minutes: number; priceCents: number };
type Slots = { open: boolean; timezone?: string; durationMin?: number; priceCents?: number; payNow?: boolean; sessions?: Session[]; days: SlotDay[] };

const visitorTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
const tzShort = (tz: string) => { try { return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || tz; } catch { return tz; } };

/** Ask once whether an offer has open times. Used to label buttons honestly. */
export function useSlots(username: string, offer: string, enabled: boolean, minutes?: number) {
  const [slots, setSlots] = useState<Slots | null>(null);
  useEffect(() => {
    if (!enabled) { setSlots({ open: false, days: [] }); return; }
    let live = true;
    fetch(`/api/booking/slots?username=${encodeURIComponent(username)}&offer=${encodeURIComponent(offer)}${minutes ? `&minutes=${minutes}` : ""}`).then((r) => r.json())
      .then((j) => { if (live) setSlots(j); }).catch(() => { if (live) setSlots({ open: false, days: [] }); });
    return () => { live = false; };
  }, [username, offer, enabled, minutes]);
  return slots;
}

export function BookingPicker({ username, offer, ownerFirst, slots: first, onClose }: { username: string; offer: string; ownerFirst: string; slots: Slots; onClose: () => void }) {
  const tz = useMemo(visitorTz, []);
  // more than one length on offer: the visitor picks one, and the open times follow it
  const sessions = first.sessions && first.sessions.length > 1 ? first.sessions : [];
  const [minutes, setMinutes] = useState(first.durationMin || 0);
  const other = useSlots(username, offer, sessions.length > 0 && minutes !== first.durationMin, minutes);
  const slots = minutes === first.durationMin ? first : other && other.durationMin === minutes ? other : { ...first, days: [], durationMin: minutes, priceCents: sessions.find((x) => x.minutes === minutes)?.priceCents || 0 };
  const loadingTimes = minutes !== first.durationMin && !(other && other.durationMin === minutes);
  // group the open times by the VISITOR's own calendar day
  const days = useMemo(() => {
    const by = new Map<string, string[]>();
    for (const d of slots.days) for (const iso of d.slots) {
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
      by.set(key, [...(by.get(key) || []), iso]);
    }
    return Array.from(by.entries()).map(([date, list]) => ({ date, slots: list.sort() })).sort((a, b) => a.date.localeCompare(b.date));
  }, [slots.days, tz]);
  const [page, setPage] = useState(0);
  const [day, setDay] = useState(days[0]?.date || "");
  const [at, setAt] = useState("");
  // a new length means a new set of times
  useEffect(() => { setAt(""); setPage(0); }, [minutes]);
  useEffect(() => { if (!days.some((d) => d.date === day)) setDay(days[0]?.date || ""); }, [days, day]);
  const [f, setF] = useState({ name: "", email: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ manageUrl: string; emailed: boolean } | null>(null);
  const PER = 5;
  const shown = days.slice(page * PER, page * PER + PER);
  const times = days.find((d) => d.date === day)?.slots || [];
  const price = slots.priceCents || 0;
  const dayLabel = (date: string) => { const [y, m, d] = date.split("-").map(Number); const dt = new Date(Date.UTC(y, m - 1, d, 12)); return { wd: new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" }).format(dt), md: new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(dt) }; };
  const timeLabel = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  const whenLabel = (iso: string) => `${new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric" }).format(new Date(iso))} at ${timeLabel(iso)} ${tzShort(tz)}`;

  const submit = async () => {
    setErr("");
    if (!at) { setErr("Pick a time first."); return; }
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr("Please add your name and a valid email."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, offer, minutes, start: at, name: f.name, email: f.email, note: f.note, timezone: tz }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "Couldn't book that time. Please try again."); if (r.status === 409) setAt(""); return; }
      if (j.checkoutUrl) { window.location.href = j.checkoutUrl; return; }
      setDone({ manageUrl: j.manageUrl, emailed: !!j.emailed });
    } catch { setErr("Couldn't reach Marquee. Please try again."); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div className="done2"><div className="ic2"><svg className="ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></div>
      <div className="t">You&apos;re booked</div>
      <div className="p">{whenLabel(at)}.{" "}{done.emailed ? `A confirmation with a calendar invite is on its way to ${f.email}.` : "Keep the link below to see or cancel your booking."}</div>
      <a className="bk-link" href={done.manageUrl}>View your booking</a>
      <button className="msub" style={{ marginTop: 18 }} onClick={onClose}>Done</button>
    </div>
  );

  return (
    <div className="bk">
      {sessions.length > 0 && (
        <>
          <span className="flbl">Choose a length</span>
          <div className="bk-lens">{sessions.map((x) => <button type="button" key={x.minutes} className={"bk-len" + (x.minutes === minutes ? " on" : "")} aria-pressed={x.minutes === minutes} onClick={() => setMinutes(x.minutes)}><b>{x.minutes} min</b>{x.priceCents > 0 && <span>{money(x.priceCents)}</span>}</button>)}</div>
        </>
      )}
      <div className="bk-meta">{slots.durationMin} minutes{price > 0 ? ` · ${money(price)}` : ""} · times shown in {tzShort(tz)}</div>
      <span className="flbl">Choose a day</span>
      <div className="bk-days">
        <button type="button" className="bk-nav" aria-label="Earlier days" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
        {shown.map((d) => { const l = dayLabel(d.date); return <button type="button" key={d.date} className={"bk-day" + (d.date === day ? " on" : "")} aria-pressed={d.date === day} onClick={() => { setDay(d.date); setAt(""); }}><span>{l.wd}</span><b>{l.md}</b></button>; })}
        <button type="button" className="bk-nav" aria-label="Later days" disabled={(page + 1) * PER >= days.length} onClick={() => setPage((p) => p + 1)}>›</button>
      </div>
      <span className="flbl">Choose a time</span>
      {loadingTimes ? <div className="bk-meta">Checking open times…</div> : days.length === 0 && <div className="bk-meta">No open times for this length right now. Try another.</div>}
      <div className="bk-times">{times.map((iso) => <button type="button" key={iso} className={"bk-time" + (iso === at ? " on" : "")} aria-pressed={iso === at} onClick={() => setAt(iso)}>{timeLabel(iso)}</button>)}</div>
      {at && (
        <>
          <div className="bk-picked">{whenLabel(at)}</div>
          <label className="flbl" htmlFor="bk-name">Your name</label><input id="bk-name" className="fin" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <label className="flbl" htmlFor="bk-email">Email</label><input id="bk-email" className="fin" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <label className="flbl" htmlFor="bk-note">What do you want to cover? <span className="bk-opt">optional</span></label>
          <textarea id="bk-note" className="fta" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </>
      )}
      {err && <div className="bk-err" role="alert">{err}</div>}
      <button className="msub" onClick={submit} disabled={busy || !at}>{busy ? "Booking…" : price > 0 && slots.payNow ? `Confirm and pay ${money(price)}` : "Confirm booking"}</button>
      {price > 0 && !slots.payNow && at && <div className="bk-fine">{money(price)}, arranged directly with {ownerFirst}. You won&apos;t be charged here.</div>}
      {price > 0 && slots.payNow && <div className="bk-fine">Free to cancel up to 24 hours before.</div>}
    </div>
  );
}

export function RequestForm({ username, offer, ownerFirst, cta = "Send request", onClose }: { username: string; offer: string; ownerFirst: string; cta?: string; onClose: () => void }) {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<"sent" | "mail" | null>(null);
  const submit = async () => {
    setErr("");
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) || !f.message.trim()) { setErr("Please add your name, a valid email, and a message."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, offer, name: f.name, email: f.email, message: f.message }) });
      const j = await r.json();
      if (j.ok) setDone("sent");
      else if (j.fallback) { window.location.href = j.fallback; setDone("mail"); } // email not switched on yet: hand off to their mail app
      else setErr(j.error || "Couldn't send that. Please try again.");
    } catch { setErr("Couldn't reach Marquee. Please try again."); }
    finally { setBusy(false); }
  };
  if (done) return (
    <div className="done2"><div className="ic2"><svg className="ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></div>
      <div className="t">{done === "sent" ? "Request sent" : "Opening your email…"}</div>
      <div className="p">{done === "sent" ? `${ownerFirst} will reply to you at ${f.email}. A copy is on its way to you.` : `Your message to ${ownerFirst} is ready in your email app. Press send to deliver it.`}</div>
      <button className="msub" style={{ marginTop: 22 }} onClick={onClose}>Done</button>
    </div>
  );
  return (
    <>
      <label className="flbl" htmlFor="rq-name">Your name</label><input id="rq-name" className="fin" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <label className="flbl" htmlFor="rq-email">Email</label><input id="rq-email" className="fin" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label className="flbl" htmlFor="rq-msg">A little context</label>
      <textarea id="rq-msg" className="fta" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      {err && <div className="bk-err" role="alert">{err}</div>}
      <button className="msub" onClick={submit} disabled={busy}>{busy ? "Sending…" : cta}</button>
    </>
  );
}
