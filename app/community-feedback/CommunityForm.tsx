"use client";
import { useState } from "react";

// The "Get to Know You" form. Contact details required, the four questions optional.
// `website_url` is a hidden trap field: real people never see it, bots fill it in, and the server drops those.

const LABEL = "block text-[12px] font-semibold tracking-[0.1em] uppercase text-ink/60 mb-[6px]";
const INPUT = "w-full font-inter text-[15px] py-[12px] px-[14px] border border-hair bg-white text-ink placeholder:text-ink/35 focus:outline-none focus:border-ink";
const Q = "font-lora text-[clamp(19px,2.4vw,23px)] leading-[1.25] text-ink";
const HINT = "text-[14px] text-ink/60 mt-1 mb-3";

const QUESTIONS: { key: "background" | "challenges" | "curious" | "anything"; q: string; hint: string }[] = [
  { key: "background", q: "Tell us a little about yourself and your professional background.", hint: "What do you do, and what are you working on?" },
  { key: "challenges", q: "What are your biggest professional challenges right now?", hint: "Finding opportunities, getting discovered, growing your business, monetizing your expertise, or something else?" },
  { key: "curious", q: "What are you most curious about when it comes to Marquee?", hint: "What would you like to learn more about?" },
  { key: "anything", q: "Anything else you'd like us to know?", hint: "Share your thoughts, ideas, questions, or feedback." },
];

export default function CommunityForm() {
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", linkedin: "", background: "", challenges: "", curious: "", anything: "" });
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.first_name.trim() || !f.last_name.trim() || !f.email.trim() || !f.linkedin.trim()) { setErr("Please add your first name, last name, email and LinkedIn."); return; }
    setState("sending");
    try {
      const r = await fetch("/api/community", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, website_url: trap, source: typeof document !== "undefined" ? document.referrer || window.location.pathname : "" }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Couldn't save. Please try again."); setState("idle"); return; }
      setState("done");
    } catch { setErr("Couldn't save. Please try again."); setState("idle"); }
  };

  if (state === "done") {
    return (
      <div className="mt-10 border border-hair bg-white p-[clamp(22px,4vw,36px)] max-w-[640px]">
        <p className="font-lora text-[clamp(20px,2.6vw,26px)] leading-[1.3]">Thanks for sharing! We&rsquo;re excited to have you be part of the Marquee community.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 max-w-[720px]" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="cf-first" className={LABEL}>First name *</label><input id="cf-first" className={INPUT} value={f.first_name} onChange={set("first_name")} autoComplete="given-name" required /></div>
        <div><label htmlFor="cf-last" className={LABEL}>Last name *</label><input id="cf-last" className={INPUT} value={f.last_name} onChange={set("last_name")} autoComplete="family-name" required /></div>
        <div><label htmlFor="cf-email" className={LABEL}>Email address *</label><input id="cf-email" type="email" className={INPUT} value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" required /></div>
        <div><label htmlFor="cf-linkedin" className={LABEL}>LinkedIn *</label><input id="cf-linkedin" type="url" className={INPUT} value={f.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/yourname" autoComplete="url" inputMode="url" required /></div>
      </div>
      <input type="text" name="website_url" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

      <div className="mt-10 grid gap-8">
        {QUESTIONS.map((x, i) => (
          <div key={x.key}>
            <label htmlFor={`cf-${x.key}`} className={Q}>{i + 1}. {x.q}</label>
            <p className={HINT}>{x.hint}</p>
            <textarea id={`cf-${x.key}`} className={`${INPUT} min-h-[120px] resize-y`} value={f[x.key]} onChange={set(x.key)} maxLength={4000} />
          </div>
        ))}
      </div>

      {err && <p className="mt-6 text-[14px] text-dred">{err}</p>}
      <div className="mt-8 flex items-center gap-4 flex-wrap">
        <button type="submit" disabled={state === "sending"} className="bg-ink text-white font-sans text-[14px] font-semibold py-[13px] px-[26px] hover:bg-dred transition-colors disabled:opacity-50">{state === "sending" ? "Sending…" : "Submit"}</button>
        <span className="text-[13px] text-ink/55 max-w-[560px] leading-[1.5]">Your responses are confidential and accessible only to the Marquee team. Information provided may be used in aggregate or anonymized form for internal research, analysis, and platform development, without attribution to you or your individual identity.</span>
      </div>
    </form>
  );
}
