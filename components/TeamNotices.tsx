"use client";
// Notifications from Team Marquee, behind the bell, and the "How is it going?" check-in pop-up.
// Both read /api/notices once per page. Nothing shows for a visitor who is not signed in.

import { useEffect, useRef, useState } from "react";
import { TEAM_CALL_URL, FEEDBACK_URL } from "@/lib/team";

type Notice = { id: number; created_at: string; tag: string; title: string; body: string; link_url: string; link_label: string; read: boolean; liked: boolean };
type Data = { notices: Notice[]; unread: number; checkin: 0 | 2 | 5 };
const EMPTY: Data = { notices: [], unread: 0, checkin: 0 };

let pending: Promise<Data> | null = null;
function load(): Promise<Data> {
  if (!pending) pending = fetch("/api/notices").then((r) => (r.ok ? r.json() : EMPTY)).catch(() => EMPTY);
  return pending;
}
const post = (body: Record<string, unknown>) => fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
// the newest notice this browser has been told about, so the callout under the bell shows once per notice
const SEEN_KEY = "mq-notice-seen";
const seenUpTo = () => { try { return Number(localStorage.getItem(SEEN_KEY) || 0); } catch { return 0; } };
const markSeen = (id: number) => { try { localStorage.setItem(SEEN_KEY, String(id)); } catch { /* private window */ } };

const BELL = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
const CHECK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.7-4.8" /></svg>;
const CLOSE = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M6 6l12 12M18 6L6 18" /></svg>;
const THUMB = (filled: boolean) => <svg viewBox="0 0 24 24" fill={filled ? "#670821" : "none"} stroke={filled ? "#670821" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>;

/** The bell. `tone` picks the colors: the profile's own bar is light; the builder bar is Tailwind. */
export function NotificationsBell({ tone = "builder" }: { tone?: "profile" | "builder" }) {
  const [d, setD] = useState<Data>(EMPTY);
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState<Notice | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    load().then((x) => {
      setD(x);
      // a notice this browser has not been told about yet: say so under the bell, once
      const newest = x.notices.find((n) => !n.read);
      if (newest && newest.id > seenUpTo()) { setNudge(newest); markSeen(newest.id); }
    });
  }, []);
  useEffect(() => {
    if (!open && !nudge) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setOpen(false); setNudge(null); } };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setNudge(null); } };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open, nudge]);
  // opening the list does not mark anything read: a notice is read when the member says so, follows its link, or dismisses it
  const toggle = () => { setOpen(!open); setNudge(null); };
  const update = (f: (n: Notice) => Notice | null) => setD((x) => { const notices = x.notices.map(f).filter((n): n is Notice => !!n); return { ...x, notices, unread: notices.filter((n) => !n.read).length }; });
  const markRead = (id: number) => { post({ read: id }); update((n) => (n.id === id ? { ...n, read: true } : n)); };
  const markAll = () => { post({ readAll: true }); update((n) => ({ ...n, read: true })); };
  const dismiss = (id: number) => { post({ dismiss: id }); update((n) => (n.id === id ? null : n)); };
  const like = (n: Notice) => { post(n.liked ? { unlike: n.id } : { like: n.id }); update((m) => (m.id === n.id ? { ...m, liked: !m.liked, read: true } : m)); };
  const color = tone === "profile" ? "var(--gray, #7d7a74)" : "#7d7a74";
  const panel: React.CSSProperties = { position: "absolute", top: "calc(100% + 12px)", right: -8, background: "#fff", border: "1px solid #E1DED7", boxShadow: "0 12px 32px rgba(20,17,14,.12)", zIndex: 300, textAlign: "left" };
  const iconBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, background: "none", border: 0, padding: 4, cursor: "pointer", color: "#9C968C", fontFamily: "inherit", fontSize: 12, fontWeight: 600 };
  const textBtn: React.CSSProperties = { fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "#670821", background: "none", border: 0, padding: 0, cursor: "pointer" };
  return (
    <div ref={box} style={{ position: "relative", display: "flex" }}>
      <button type="button" onClick={toggle} aria-label={d.unread ? `${d.unread} unread notifications` : "Notifications"} aria-expanded={open} style={{ position: "relative", display: "flex", background: "none", border: 0, padding: 0, cursor: "pointer", color: open ? "#1A1A1A" : d.unread ? "#670821" : color }}>
        {BELL}
        {d.unread > 0 && <span aria-hidden style={{ position: "absolute", top: -9, right: -10, minWidth: 18, height: 18, padding: "0 5px", boxSizing: "border-box", background: "#670821", color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: "18px", textAlign: "center", fontFamily: "Inter, system-ui, sans-serif", outline: "2px solid #fff" }}>{d.unread}</span>}
      </button>
      {nudge && !open && (
        <div role="status" className="font-inter" style={{ ...panel, width: 300, maxWidth: "calc(100vw - 32px)", padding: "14px 16px", cursor: "pointer" }} onClick={toggle}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#670821", marginBottom: 6 }}>New from Team Marquee{nudge.tag ? ` · ${nudge.tag}` : ""}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.3 }}>{nudge.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
            <button type="button" onClick={toggle} style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#670821", background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Open</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setNudge(null); }} style={{ fontFamily: "inherit", fontSize: 13, color: "#7d7a74", background: "none", border: 0, padding: 0, cursor: "pointer" }}>Later</button>
          </div>
        </div>
      )}
      {open && (
        <div role="dialog" aria-label="Notifications" className="font-inter" style={{ ...panel, width: 360, maxWidth: "calc(100vw - 32px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #F1EEE8" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#6E6A62", flex: 1 }}>From Team Marquee</div>
            {d.unread > 0 && <button type="button" onClick={markAll} style={textBtn}>Mark all as read</button>}
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {d.notices.length === 0 && <div style={{ padding: "22px 16px", fontSize: 13.5, color: "#7d7a74" }}>Nothing new yet.</div>}
            {d.notices.map((n) => (
              <div key={n.id} style={{ padding: "14px 12px 12px 16px", borderBottom: "1px solid #F1EEE8", borderLeft: n.read ? "3px solid transparent" : "3px solid #670821", background: n.read ? "#fff" : "#FBF9F5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 3 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: n.tag ? "#670821" : "#9C968C" }}>{n.tag || "Team Marquee"}</div>
                  <div style={{ fontSize: 11.5, color: "#9C968C", whiteSpace: "nowrap" }}>{when(n.created_at)}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: "#1A1A1A", lineHeight: 1.3 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 13, color: "#3a352f", lineHeight: 1.5, marginTop: 4, whiteSpace: "pre-line" }}>{n.body}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  {n.link_url ? <a href={n.link_url} onClick={() => markRead(n.id)} target={n.link_url.startsWith("/") ? undefined : "_blank"} rel="noopener" style={{ fontSize: 13, fontWeight: 600, color: "#670821", textDecoration: "underline", textUnderlineOffset: 3, marginRight: "auto" }}>{n.link_label || "Read more"}</a> : <span style={{ marginRight: "auto" }} />}
                  <button type="button" onClick={() => like(n)} aria-pressed={n.liked} aria-label={n.liked ? "You liked this" : "Like"} title={n.liked ? "Liked" : "Like"} style={{ ...iconBtn, color: n.liked ? "#670821" : "#9C968C" }}>{THUMB(n.liked)}{n.liked && <span>Liked</span>}</button>
                  {!n.read && <button type="button" onClick={() => markRead(n.id)} aria-label="Mark as read" title="Mark as read" style={iconBtn}>{CHECK}</button>}
                  <button type="button" onClick={() => dismiss(n.id)} aria-label="Dismiss" title="Dismiss" style={iconBtn}>{CLOSE}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** "How's it going?" Shown on a member's 2nd and 5th visit; the answer goes to Team Marquee. */
export function CheckIn() {
  const [due, setDue] = useState<0 | 2 | 5>(0);
  const [choice, setChoice] = useState<"" | "great" | "starting" | "ok">("");
  const [answer, setAnswer] = useState<"" | "great" | "starting" | "ok">("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { load().then((d) => setDue(d.checkin)); }, []);
  if (!due) return null;
  const send = async () => {
    if (!choice) return;
    setBusy(true);
    await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ask: due, answer: choice }) }).catch(() => null);
    setBusy(false); setAnswer(choice);
  };
  const close = () => setDue(0);
  const OPTIONS: [typeof choice, string][] = [["great", "Great! Loving it so far."], ["starting", "Just getting started."], ["ok", "It's just okay."]];
  return (
    <div className="fixed inset-0 z-[400] bg-black/40 flex items-center justify-center p-5 font-inter" onClick={answer ? close : undefined}>
      <div role="dialog" aria-label="How's it going?" className="bg-white w-full max-w-[460px] p-7" onClick={(e) => e.stopPropagation()}>
        {!answer ? (
          <>
            <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-3">Marquee Beta</div>
            <h2 className="font-lora text-[26px] leading-[1.15] mb-2">How&rsquo;s it going?</h2>
            <p className="text-[14.5px] text-[#3a352f] leading-[1.55] mb-5">We&rsquo;d love your feedback as we continue to improve Marquee.</p>
            <div className="flex flex-col gap-3 mb-6">
              {OPTIONS.map(([v, label]) => (
                <label key={v} className="flex items-center gap-3 cursor-pointer text-[15px] text-[#1A1A1A]">
                  <input type="radio" name="checkin" value={v} checked={choice === v} onChange={() => setChoice(v)} className="peer sr-only" />
                  <span aria-hidden className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center ${choice === v ? "border-[#1A1A1A] border-[2px]" : "border-[#C9C5BD]"}`}>{choice === v && <span className="w-[10px] h-[10px] rounded-full bg-[#1A1A1A]" />}</span>
                  {label}
                </label>
              ))}
            </div>
            <button type="button" disabled={!choice || busy} onClick={send} className="w-full font-sans bg-brand-ink text-white text-[14px] font-medium py-[13px] disabled:opacity-40">{busy ? "Sending…" : "Share feedback"}</button>
          </>
        ) : (
          <>
            {answer === "ok" && <h2 className="font-lora text-[26px] leading-[1.15] mb-2">There are many things in the works.</h2>}
            <p className="text-[15px] text-[#1A1A1A] leading-[1.5] mb-6">{answer === "great" ? "Good to hear, reach out if you need support!" : answer === "starting" ? "Book a session for onboarding." : "We would love your feedback."}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <a href={TEAM_CALL_URL} target="_blank" rel="noopener" onClick={close} className="font-sans bg-brand-ink text-white text-[13px] font-medium py-[11px] px-5">{answer === "starting" ? "Book a session" : "Book a call"}</a>
              <a href={FEEDBACK_URL} onClick={close} className="font-sans text-[13px] font-medium py-[10px] px-5 border border-[#E1DED7] text-[#1A1A1A] hover:border-brand-ink">Share feedback</a>
              <button type="button" onClick={close} className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink ml-auto">Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
