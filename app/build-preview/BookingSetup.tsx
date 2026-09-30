"use client";
// Booking setup, shown in the builder's Work With Me step. The person picks a date on a
// calendar and opens one or more time ranges on it (say 9–11 and 2–4). Also: timezone,
// call link, getting paid, and their upcoming bookings. Saves as you go.

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { BLANK_SETTINGS, bookableRange, money, payoutCents, hasHours, tidyRanges, validRange, whenLabel, type BookingSettings, type Range } from "@/lib/booking";

type Upcoming = { id: string; offer_title: string; starts_at: string; ends_at: string; visitor_name: string; visitor_email: string; visitor_note: string | null; price_cents: number };
type Req = { id: string; offer_title: string; visitor_name: string; visitor_email: string; visitor_note: string | null; created_at: string };
type Pay = { available: boolean; connected: boolean; ready: boolean };

const browserTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"; } catch { return "America/New_York"; } };
const zones = (): string[] => { try { return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone"); } catch { return ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Singapore", "Australia/Sydney"]; } };
const inp = "font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
const lab = "font-sans text-[13px] font-semibold block mb-[6px]";

// calendar dates are plain "YYYY-MM-DD" text, so no timezone can shift them
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIn = (tz: string) => { try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch { return new Date().toISOString().slice(0, 10); } };
const asUtc = (date: string) => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
const longDate = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(asUtc(date));
const weekday = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" }).format(asUtc(date));
const addDays = (date: string, n: number) => { const d = asUtc(date); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const clock = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? ":" + pad(m) : ""} ${h < 12 ? "AM" : "PM"}`; };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// `forOffers` names the offers set to "Book instantly". With none, there is nothing to schedule,
// so only incoming requests and bookings are shown.
// `preview` shows the controls without loading or saving anything (used to check the design).
const EXAMPLE_CENTS = 15000; // the worked example in the payout wording

export function BookingSetup({ username, forOffers, preview }: { username: string; forOffers: string[]; preview?: boolean }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [s, setS] = useState<BookingSettings>({ ...BLANK_SETTINGS, timezone: browserTz() });
  const [state, setState] = useState<"loading" | "ready" | "off">("loading"); // "off": the database step hasn't been run yet
  const [saved, setSaved] = useState<"" | "saving" | "saved" | "error">("");
  const [pay, setPay] = useState<Pay | null>(null);
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const dirty = useRef(false);
  const uid = useRef("");

  const today = todayIn(s.timezone);
  const [view, setView] = useState(() => { const t = todayIn(browserTz()); return { y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) - 1 }; });
  const [picked, setPicked] = useState("");

  const loadBookings = () => fetch("/api/booking").then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) { setUpcoming(j.upcoming || []); setRequests(j.requests || []); } }).catch(() => {});

  useEffect(() => {
    if (preview) { setState("ready"); setPay({ available: false, connected: false, ready: false }); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("off"); return; }
      uid.current = user.id;
      const { data, error } = await supabase.from("booking_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (error) { setState("off"); return; }
      if (data) setS({ timezone: data.timezone || browserTz(), dates: (data.weekly && data.weekly.dates) || {}, meeting_link: data.meeting_link || "", notice_hours: data.notice_hours ?? 2, buffer_min: data.buffer_min ?? 0 });
      setState("ready");
      fetch("/api/stripe/connect").then((r) => (r.ok ? r.json() : null)).then((j) => j && setPay(j)).catch(() => {});
      loadBookings();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // save a moment after the last change; half-typed or back-to-front times are left out until fixed
  useEffect(() => {
    if (state !== "ready" || !dirty.current || preview) return;
    setSaved("saving");
    const t = setTimeout(async () => {
      const dates: BookingSettings["dates"] = {};
      for (const [d, list] of Object.entries(s.dates)) { const ok = tidyRanges(list); if (d >= today && ok.length) dates[d] = ok; }
      const { error } = await supabase.from("booking_settings").upsert({ user_id: uid.current, username, timezone: s.timezone, weekly: { dates }, meeting_link: s.meeting_link.trim(), notice_hours: s.notice_hours, buffer_min: s.buffer_min, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      setSaved(error ? "error" : "saved");
    }, 700);
    return () => clearTimeout(t);
  }, [s, state, supabase, username, today, preview]);

  const up = (patch: Partial<BookingSettings>) => { dirty.current = true; setS((c) => ({ ...c, ...patch })); };
  const setDay = (date: string, list: Range[]) => { const dates = { ...s.dates }; if (list.length) dates[date] = list; else delete dates[date]; up({ dates }); };
  const ranges = picked ? s.dates[picked] || [] : [];
  // a sensible next range: an hour after the last one ends, or 9–10 on an empty day
  const nextRange = (list: Range[]): Range => {
    const last = list[list.length - 1];
    if (!last || !validRange(last)) return { start: "09:00", end: "10:00" };
    const h = Math.min(22, Number(last.end.slice(0, 2)) + 1);
    return { start: `${pad(h)}:00`, end: `${pad(Math.min(23, h + 1))}:00` };
  };
  const pick = (date: string) => { setPicked(date); if (!(s.dates[date] || []).length) setDay(date, [{ start: "09:00", end: "10:00" }]); };
  const repeat = (weeks: number) => { const dates = { ...s.dates }; for (let i = 1; i <= weeks; i++) dates[addDays(picked, 7 * i)] = ranges.map((r) => ({ ...r })); up({ dates }); };

  const connect = async () => {
    setBusy("stripe"); setNote("");
    try { const r = await fetch("/api/stripe/connect", { method: "POST" }); const j = await r.json(); if (j.url) { window.location.href = j.url; return; } setNote(j.error || "Couldn't open Stripe. Please try again."); }
    catch { setNote("Couldn't open Stripe. Please try again."); }
    setBusy("");
  };
  const cancel = async (b: Upcoming) => {
    if (!window.confirm(`Cancel ${b.offer_title} with ${b.visitor_name}? They will be told by email${b.price_cents > 0 ? " and refunded" : ""}.`)) return;
    setBusy(b.id); setNote("");
    try { const r = await fetch("/api/booking/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); const j = await r.json(); if (!r.ok) setNote(j.error || "Couldn't cancel. Please try again."); else await loadBookings(); }
    catch { setNote("Couldn't cancel. Please try again."); }
    setBusy("");
  };

  const setup = forOffers.length > 0;
  const names = forOffers.length > 1 ? `${forOffers.slice(0, -1).join(", ")} and ${forOffers[forOffers.length - 1]}` : forOffers[0] || "";
  if (!setup && upcoming.length === 0 && requests.length === 0) return null;
  if (state === "loading") return setup ? <div className="border border-[#E1DED7] p-[18px] mb-4 max-w-[980px] text-[13px] text-[#7d7a74]">Loading booking times…</div> : null;
  if (state === "off") return setup ? <div className="border border-[#E1DED7] bg-[#FFFFFF] p-[18px] mb-4 max-w-[980px]"><div className="font-sans text-[14px] font-semibold mb-1">Booking times</div><p className="text-[13px] text-[#7d7a74] leading-[1.5]">Booking isn&apos;t switched on yet. Until it is, every offer uses Send request.</p></div> : null;

  // the month grid
  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => ymd(view.y, view.m, i + 1))];
  const thisMonth = view.y === Number(today.slice(0, 4)) && view.m === Number(today.slice(5, 7)) - 1;
  const move = (n: number) => setView((v) => { const d = new Date(Date.UTC(v.y, v.m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const open = hasHours(s.dates, today);
  const coming = Object.keys(s.dates).filter((d) => d >= today && tidyRanges(s.dates[d]).length).sort();
  const bad = ranges.some((r) => !validRange(r));
  // a time can be open on the calendar and still hidden from visitors, because it is too soon
  const tooSoon = (d: string) => tidyRanges(s.dates[d] || []).every((r) => !bookableRange(d, r, s.timezone, s.notice_hours));
  const noticeText = ({ 2: "2 hours", 12: "12 hours", 24: "1 day", 48: "2 days", 72: "3 days" } as Record<number, string>)[s.notice_hours] || `${s.notice_hours} hours`;
  const hiddenDates = coming.filter(tooSoon);

  return (
    <div className="border border-[#E1DED7] p-[20px] mb-4 max-w-[980px]">
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-sans text-[15px] font-semibold">{setup ? "Booking times" : "Requests and bookings"}</div>
        <span className="text-[11.5px] text-[#7d7a74]" role="status">{saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : saved === "error" ? "Couldn't save. Check your connection." : ""}</span>
      </div>
      {setup && (<>
      <p className="text-[13px] text-[#7d7a74] leading-[1.5] mb-5">For <b className="font-semibold text-[#3a352f]">{names}</b>. Pick a date, then set the times you&apos;re free that day. You can add more than one time to a day. {open ? "" : `Until you open a date, ${forOffers.length > 1 ? "these offers use" : "this offer uses"} Send request.`}</p>

      <div className="grid sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-[24px] mb-5">
        <div>
          <div className="flex items-center justify-between mb-[10px]">
            <button type="button" aria-label="Earlier month" disabled={thisMonth} onClick={() => move(-1)} className="w-[32px] h-[32px] border border-[#E1DED7] bg-white text-[16px] disabled:opacity-30 hover:border-brand-ink">‹</button>
            <div className="font-sans text-[13.5px] font-semibold" aria-live="polite">{MONTHS[view.m]} {view.y}</div>
            <button type="button" aria-label="Later month" onClick={() => move(1)} className="w-[32px] h-[32px] border border-[#E1DED7] bg-white text-[16px] hover:border-brand-ink">›</button>
          </div>
          <div className="grid grid-cols-7 gap-[3px] text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="font-sans text-[10.5px] font-semibold text-[#a8a29a] py-[4px]">{d}</div>)}
            {cells.map((date, i) => {
              if (!date) return <div key={"e" + i} />;
              const past = date < today, has = tidyRanges(s.dates[date] || []).length > 0, on = date === picked;
              return (
                <button type="button" key={date} disabled={past} aria-pressed={on} aria-label={`${longDate(date)}${has ? ", has open times" : ""}`} onClick={() => pick(date)}
                  className={`relative h-[38px] font-sans text-[13px] border ${on ? "bg-brand-ink text-white border-brand-ink" : has ? "bg-[#F1EEE8] border-[#E1DED7] font-semibold hover:border-brand-ink" : past ? "border-transparent text-[#cfcac0]" : "bg-white border-[#ECEAE4] hover:border-brand-ink"} ${date === today && !on ? "underline underline-offset-4" : ""}`}>
                  {Number(date.slice(8))}
                  {has && <span className={`absolute left-1/2 -translate-x-1/2 bottom-[4px] w-[4px] h-[4px] rounded-full ${on ? "bg-white" : "bg-brand-ink"}`} />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {!picked ? <p className="text-[13px] text-[#7d7a74] leading-[1.5] sm:pt-[42px]">Pick a date on the calendar to set its times.</p> : (
            <>
              <div className="font-sans text-[13.5px] font-semibold mb-[10px]">{longDate(picked)}</div>
              {ranges.map((r, i) => (
                <div key={i} className="flex items-center gap-[8px] mb-[8px]">
                  <input type="time" aria-label={`Time ${i + 1} start`} value={r.start} onChange={(e) => setDay(picked, ranges.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className={inp + " w-[118px]"} />
                  <span className="text-[13px] text-[#7d7a74]">to</span>
                  <input type="time" aria-label={`Time ${i + 1} end`} value={r.end} onChange={(e) => setDay(picked, ranges.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className={inp + " w-[118px]"} />
                  <button type="button" aria-label={`Remove time ${i + 1}`} onClick={() => setDay(picked, ranges.filter((_, j) => j !== i))} className="text-[16px] text-[#7d7a74] hover:text-[#AB0000] px-[6px]">×</button>
                </div>
              ))}
              {bad && <p className="text-[12.5px] text-[#AB0000] mb-2">An end time needs to be later than its start time.</p>}
              {!bad && ranges.length > 0 && tooSoon(picked) && <p className="text-[12.5px] text-[#AB0000] leading-[1.5] mb-2" role="status">People can&apos;t book this yet. You ask for {noticeText} of notice, and this is sooner than that. Shorten &ldquo;Earliest someone can book&rdquo; below, or pick a later date.</p>}
              <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] mt-[10px]">
                <button type="button" onClick={() => setDay(picked, [...ranges, nextRange(ranges)])} className="font-sans text-[12.5px] font-semibold underline underline-offset-4 hover:text-brand-ink">+ Add another time</button>
                {ranges.length > 0 && !bad && <button type="button" onClick={() => repeat(4)} className="font-sans text-[12.5px] text-[#7d7a74] underline underline-offset-4 hover:text-brand-ink">Repeat for the next 4 {weekday(picked)}s</button>}
                {ranges.length > 0 && <button type="button" onClick={() => setDay(picked, [])} className="font-sans text-[12.5px] text-[#7d7a74] underline underline-offset-4 hover:text-[#AB0000]">Clear this day</button>}
              </div>
            </>
          )}
        </div>
      </div>

      {coming.length > 0 && (
        <div className="mb-5">
          <div className={lab}>Your open dates</div>
          <div className="flex flex-wrap gap-[6px]">
            {coming.slice(0, 12).map((d) => <button type="button" key={d} onClick={() => { setPicked(d); setView({ y: Number(d.slice(0, 4)), m: Number(d.slice(5, 7)) - 1 }); }} className="text-left font-sans text-[12.5px] py-[6px] px-[10px] bg-[#F1EEE8] hover:bg-[#E9E6DF]"><b className="font-semibold">{new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(asUtc(d))}</b> <span className="text-[#7d7a74]">{tidyRanges(s.dates[d]).map((r) => `${clock(r.start)} – ${clock(r.end)}`).join(", ")}</span>{tooSoon(d) && <span className="text-[#AB0000]"> · too soon to book</span>}</button>)}
            {coming.length > 12 && <span className="font-sans text-[12.5px] text-[#7d7a74] py-[6px]">and {coming.length - 12} more</span>}
          </div>
          {coming.length > 0 && hiddenDates.length === coming.length && <p className="text-[12.5px] text-[#AB0000] leading-[1.5] mt-2" role="status">None of your dates can be booked right now, so your offer shows Send request. Each one is sooner than your {noticeText} of notice.</p>}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-[16px] mb-5">
        <div><label htmlFor="bk-tz" className={lab}>Your timezone</label><select id="bk-tz" value={s.timezone} onChange={(e) => up({ timezone: e.target.value })} className={inp + " w-full"}>{[...new Set([s.timezone, ...zones()])].map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}</select></div>
        <div><label htmlFor="bk-notice" className={lab}>Earliest someone can book</label><select id="bk-notice" value={s.notice_hours} onChange={(e) => up({ notice_hours: Number(e.target.value) })} className={inp + " w-full"}>{[[2, "2 hours ahead"], [12, "12 hours ahead"], [24, "1 day ahead"], [48, "2 days ahead"], [72, "3 days ahead"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      </div>

      <div className="mb-5">
        <label htmlFor="bk-link" className={lab}>Your call link <span className="font-normal text-[#a8a29a]">· Google Meet or Zoom</span></label>
        <input id="bk-link" value={s.meeting_link} onChange={(e) => up({ meeting_link: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" className={inp + " w-full"} />
        <p className="text-[12px] text-[#7d7a74] mt-[6px]">Sent only to people who have booked. It is never shown on your profile.</p>
        {open && !s.meeting_link.trim() && <p className="text-[12.5px] text-[#AB0000] mt-[6px]" role="status">Add your link, or people who book won&apos;t know where to join.</p>}
        {s.meeting_link.trim() && !/^https?:\/\/\S+\.\S+/.test(s.meeting_link.trim()) && <p className="text-[12.5px] text-[#AB0000] mt-[6px]" role="status">That doesn&apos;t look like a link. It should start with https://</p>}
      </div>

      <div className="border-t border-[#ECEAE4] pt-4 mb-1">
        <div className={lab}>Getting paid</div>
        {!pay ? <p className="text-[13px] text-[#7d7a74]">Checking…</p>
          : !pay.available ? <p className="text-[13px] text-[#7d7a74] leading-[1.5]">Payments are not switched on for Marquee yet. People can still book, and you arrange payment with them directly.</p>
          : pay.ready ? <p className="text-[13px] leading-[1.5]"><span className="font-semibold">Connected and ready.</span> <span className="text-[#7d7a74]">You&apos;re ready to accept paid bookings through Marquee. Payments are processed securely by Stripe and sent directly to your bank. Marquee takes 5% on paid bookings, plus standard payment processing of 2.9% + 30¢: a {money(EXAMPLE_CENTS)} session pays you {money(payoutCents(EXAMPLE_CENTS))}.</span></p>
          : (<>
              <p className="text-[13px] leading-[1.5] mb-1 font-semibold">{pay.connected ? "Almost there" : "Get paid through Marquee"}</p>
              <p className="text-[13px] text-[#7d7a74] leading-[1.5] mb-3">{pay.connected ? "Stripe needs a few more details before you can get paid, usually ID or bank information. Paid bookings will be turned on once your Stripe account is ready." : `Set your rate and accept payments directly through your Marquee storefront. Marquee takes 5% on paid bookings, plus standard payment processing of 2.9% + 30¢. Payments and payouts are handled by Stripe. A ${money(EXAMPLE_CENTS)} session pays you ${money(payoutCents(EXAMPLE_CENTS))}.`}</p>
              <button onClick={connect} disabled={busy === "stripe"} className="bg-brand-ink text-white font-sans text-[13px] font-semibold py-[10px] px-[16px] disabled:opacity-50">{busy === "stripe" ? "Opening Stripe…" : pay.connected ? "Finish setting up Stripe" : "Connect Stripe"}</button>
            </>)}
      </div>
      </>)}
      {note && <p className="text-[12.5px] text-[#AB0000] mt-2" role="alert">{note}</p>}

      {(upcoming.length > 0 || requests.length > 0) && (
        <div className={setup ? "border-t border-[#ECEAE4] pt-4 mt-4" : "mt-2"}>
          {upcoming.length > 0 && (<>
            <div className={lab}>Upcoming bookings</div>
            <div className="mb-4">{upcoming.map((b) => (
              <div key={b.id} className="flex items-start justify-between gap-3 py-[10px] border-b border-[#F1EEE8] last:border-b-0">
                <div className="min-w-0"><div className="font-sans text-[13.5px] font-semibold">{b.visitor_name} · {b.offer_title}{b.price_cents > 0 ? ` · ${money(b.price_cents)}` : ""}</div><div className="text-[12.5px] text-[#7d7a74]">{whenLabel(b.starts_at, b.ends_at, s.timezone)}</div><a href={`mailto:${b.visitor_email}`} className="text-[12.5px] underline underline-offset-2">{b.visitor_email}</a>{b.visitor_note && <div className="text-[12.5px] text-[#3a352f] mt-1 whitespace-pre-line">{b.visitor_note}</div>}</div>
                <button onClick={() => cancel(b)} disabled={busy === b.id} className="font-sans text-[12px] text-[#7d7a74] hover:text-[#AB0000] shrink-0">{busy === b.id ? "Cancelling…" : "Cancel"}</button>
              </div>
            ))}</div>
          </>)}
          {requests.length > 0 && (<>
            <div className={lab}>Recent requests</div>
            <div>{requests.map((r) => (
              <div key={r.id} className="py-[10px] border-b border-[#F1EEE8] last:border-b-0">
                <div className="font-sans text-[13.5px] font-semibold">{r.visitor_name} · {r.offer_title}</div>
                <a href={`mailto:${r.visitor_email}`} className="text-[12.5px] underline underline-offset-2">{r.visitor_email}</a>
                {r.visitor_note && <div className="text-[12.5px] text-[#3a352f] mt-1 whitespace-pre-line">{r.visitor_note}</div>}
              </div>
            ))}</div>
          </>)}
        </div>
      )}
    </div>
  );
}
