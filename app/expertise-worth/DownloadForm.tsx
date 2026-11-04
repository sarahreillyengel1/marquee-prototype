"use client";
import { useEffect, useState } from "react";

// The download form on marquee.bio/expertise-worth. First name + email, then the PDF.
// `website_url` is a hidden trap field: real people never see it, bots fill it in, and the server drops those.
// DRAFT COPY: labels and the two thank-you states are not yet approved by Sarah word for word.

const LABEL = "block text-[11px] font-bold tracking-[0.2em] uppercase text-ink/65 mb-[7px]";
const INPUT = "w-full text-[15px] py-[12px] px-[14px] border border-hair bg-white text-ink placeholder:text-ink/35 focus:outline-none focus:border-ink";
const BTN = "inline-block w-full sm:w-auto px-7 py-[14px] rounded-full bg-red text-white text-[14px] font-semibold text-center hover:bg-dred transition-colors disabled:opacity-50";

export default function DownloadForm({ ready, pdf }: { ready: boolean; pdf: string }) {
  const [f, setF] = useState({ first_name: "", email: "" });
  const [trap, setTrap] = useState("");
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const u: Record<string, string> = {};
      for (const k of ["utm_source", "utm_medium", "utm_campaign"]) { const v = q.get(k); if (v) u[k] = v.slice(0, 120); }
      setUtm(u);
    } catch { /* no window */ }
  }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.first_name.trim() || !f.email.trim()) { setErr("Please add your first name and email."); return; }
    setState("sending");
    try {
      const r = await fetch("/api/reports/expertise-worth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, ...utm, website_url: trap }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Couldn't save. Please try again."); setState("idle"); return; }
      setState("done");
    } catch { setErr("Couldn't save. Please try again."); setState("idle"); }
  };

  if (state === "done") {
    return (
      <div className="bg-beige rounded-[10px] p-[clamp(24px,4vw,40px)]">
        {ready ? (
          <>
            <p className="font-lora text-[clamp(24px,2.8vw,32px)] leading-[1.2]">Your report is ready.</p>
            <a href={pdf} download className={`${BTN} mt-6`}>Download the PDF</a>
            <p className="mt-5 text-[14px] text-ink/65 leading-[1.5]">Keep this page open while it downloads.</p>
          </>
        ) : (
          <>
            <p className="font-lora text-[clamp(24px,2.8vw,32px)] leading-[1.2]">You&rsquo;re on the list.</p>
            <p className="mt-3 text-[15.5px] leading-[1.6]">We&rsquo;ll email you the report the day it comes out.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-beige rounded-[10px] p-[clamp(24px,4vw,40px)]" noValidate>
      <p className="font-lora text-[clamp(22px,2.4vw,28px)] leading-[1.2]">{ready ? "Get the report" : "Get the report when it comes out"}</p>
      <p className="mt-2 text-[14.5px] text-ink/70 leading-[1.5]">Free. Sent to your email, no account needed.</p>
      <div className="grid gap-4 mt-6">
        <div><label htmlFor="ew-first" className={LABEL}>First name</label><input id="ew-first" className={INPUT} value={f.first_name} onChange={set("first_name")} autoComplete="given-name" required /></div>
        <div><label htmlFor="ew-email" className={LABEL}>Email</label><input id="ew-email" type="email" className={INPUT} value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" required /></div>
      </div>
      <input type="text" name="website_url" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      {err && <p className="mt-4 text-[14px] text-dred">{err}</p>}
      <div className="mt-6">
        <button type="submit" disabled={state === "sending"} className={BTN}>{state === "sending" ? "One moment…" : ready ? "Download the report" : "Save my spot"}</button>
      </div>
      <p className="mt-4 text-[12.5px] text-ink/55 leading-[1.5]">We&rsquo;ll also send you Future Worth, Marquee&rsquo;s essays and news. Unsubscribe any time.</p>
    </form>
  );
}
