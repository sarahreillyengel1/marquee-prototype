"use client";
import { useState } from "react";

// Future Worth Club application. `website_url` is a hidden trap field: real people never see it, bots fill it in, and the server drops those.

const LABEL = "block text-[11px] font-medium tracking-[0.22em] uppercase text-ink/65 mb-[7px]";
const INPUT = "w-full text-[15px] py-[12px] px-[14px] border border-hair bg-white text-ink placeholder:text-ink/35 focus:outline-none focus:border-[#1E3A2C]";

export default function ApplyForm() {
  const [f, setF] = useState({ name: "", email: "", link: "", instagram: "", why: "" });
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim() || !f.email.trim() || !f.link.trim() || !f.why.trim()) { setErr("Please add your name, email, a LinkedIn or Marquee profile, and a few words about yourself."); return; }
    setState("sending");
    try {
      const r = await fetch("/api/club/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, why: f.why, website_url: trap, source: typeof window !== "undefined" ? window.location.pathname : "" }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Couldn't save. Please try again."); setState("idle"); return; }
      setState("done");
    } catch { setErr("Couldn't save. Please try again."); setState("idle"); }
  };

  if (state === "done") {
    return (
      <div id="apply" className="bg-beige text-ink rounded-[10px] p-[clamp(24px,4vw,40px)]">
        <p className="font-[family-name:var(--fw-display)] text-[clamp(22px,2.6vw,30px)] leading-[1.25]">Thanks for your interest in Future Worth Club!</p>
        <p className="mt-3 text-[15.5px] leading-[1.6]">We&rsquo;ve received your application and will be in touch soon.</p>
      </div>
    );
  }

  return (
    <form id="apply" onSubmit={submit} className="bg-beige text-ink rounded-[10px] p-[clamp(24px,4vw,40px)] scroll-mt-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="fw-name" className={LABEL}>Name</label><input id="fw-name" className={INPUT} value={f.name} onChange={set("name")} autoComplete="name" required /></div>
        <div><label htmlFor="fw-email" className={LABEL}>Email</label><input id="fw-email" type="email" className={INPUT} value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" required /></div>
        <div><label htmlFor="fw-link" className={LABEL}>LinkedIn or Marquee profile</label><input id="fw-link" type="url" className={INPUT} value={f.link} onChange={set("link")} placeholder="linkedin.com/in/you or marquee.bio/you" autoComplete="url" inputMode="url" required /></div>
        <div><label htmlFor="fw-ig" className={LABEL}>Instagram <span className="normal-case tracking-normal">(optional)</span></label><input id="fw-ig" className={INPUT} value={f.instagram} onChange={set("instagram")} placeholder="@you" autoComplete="off" /></div>
      </div>
      <input type="text" name="website_url" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      <div className="mt-5">
        <label htmlFor="fw-why" className={LABEL}>Tell us about yourself</label>
        <textarea id="fw-why" className={`${INPUT} min-h-[130px] resize-y`} value={f.why} onChange={set("why")} maxLength={4000} placeholder="What are you working on, what interests you, and what would you bring to the Club?" />
      </div>
      {err && <p className="mt-5 text-[14px] text-dred">{err}</p>}
      <div className="mt-6 flex items-center gap-4 flex-wrap">
        <button type="submit" disabled={state === "sending"} className="bg-red text-white rounded-full text-[13px] font-medium uppercase tracking-[0.18em] py-[14px] px-7 hover:bg-[#1E3A2C] transition-colors disabled:opacity-50">{state === "sending" ? "Sending…" : "Apply to Join"}</button>
        <span className="text-[13px] text-ink/60 leading-[1.5]">We review applications individually and will be in touch by email.</span>
      </div>
    </form>
  );
}
