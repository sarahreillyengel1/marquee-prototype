"use client";
// Notifications from Team Marquee, behind the bell, and the "How is it going?" check-in pop-up.
// Both read /api/notices once per page. Nothing shows for a visitor who is not signed in.

import { useEffect, useRef, useState } from "react";
import { TEAM_CALL_URL, FEEDBACK_URL } from "@/lib/team";

type Notice = { id: number; created_at: string; title: string; body: string; link_url: string; link_label: string; read: boolean };
type Data = { notices: Notice[]; unread: number; checkin: 0 | 2 | 5 };
const EMPTY: Data = { notices: [], unread: 0, checkin: 0 };

let pending: Promise<Data> | null = null;
function load(): Promise<Data> {
  if (!pending) pending = fetch("/api/notices").then((r) => (r.ok ? r.json() : EMPTY)).catch(() => EMPTY);
  return pending;
}
const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const BELL = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;

/** The bell. `tone` picks the colors: the profile's own bar is light; the builder bar is Tailwind. */
export function NotificationsBell({ tone = "builder" }: { tone?: "profile" | "builder" }) {
  const [d, setD] = useState<Data>(EMPTY);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { load().then(setD); }, []);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const toggle = () => {
    const next = !open; setOpen(next);
    if (next && d.unread > 0) {
      fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) }).catch(() => null);
      setD((x) => ({ ...x, unread: 0, notices: x.notices.map((n) => ({ ...n, read: true })) }));
    }
  };
  const color = tone === "profile" ? "var(--gray, #7d7a74)" : "#7d7a74";
  return (
    <div ref={box} style={{ position: "relative", display: "flex" }}>
      <button type="button" onClick={toggle} aria-label={d.unread ? `${d.unread} new notifications` : "Notifications"} aria-expanded={open} style={{ position: "relative", display: "flex", background: "none", border: 0, padding: 0, cursor: "pointer", color: open ? "#1A1A1A" : color }}>
        {BELL}
        {d.unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "#670821", borderRadius: "50%", border: "2px solid #fff" }} />}
      </button>
      {open && (
        <div role="dialog" aria-label="Notifications" className="font-inter" style={{ position: "absolute", top: "calc(100% + 12px)", right: -8, width: 340, maxWidth: "calc(100vw - 32px)", background: "#fff", border: "1px solid #E1DED7", boxShadow: "0 12px 32px rgba(20,17,14,.12)", zIndex: 300, textAlign: "left" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1EEE8", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#6E6A62" }}>From Team Marquee</div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {d.notices.length === 0 && <div style={{ padding: "22px 16px", fontSize: 13.5, color: "#7d7a74" }}>Nothing new yet.</div>}
            {d.notices.map((n) => (
              <div key={n.id} style={{ padding: "14px 16px", borderBottom: "1px solid #F1EEE8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.3 }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: "#9C968C", whiteSpace: "nowrap" }}>{when(n.created_at)}</div>
                </div>
                {n.body && <div style={{ fontSize: 13, color: "#3a352f", lineHeight: 1.5, marginTop: 4, whiteSpace: "pre-line" }}>{n.body}</div>}
                {n.link_url && <a href={n.link_url} target={n.link_url.startsWith("/") ? undefined : "_blank"} rel="noopener" style={{ display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 600, color: "#670821", textDecoration: "underline", textUnderlineOffset: 3 }}>{n.link_label || "Read more"}</a>}
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
