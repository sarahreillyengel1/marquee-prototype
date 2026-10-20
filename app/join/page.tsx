"use client";
// Join Marquee: use a code or request one, choose monthly or annual, pay on Stripe, then create the account.

import { useEffect, useState } from "react";
import Link from "next/link";

const PLANS = [
  { key: "founding_monthly", name: "Monthly", price: "$20", per: "/month", withCode: "$0 today. Then $20/month starting next month." },
  { key: "founding_yearly", name: "Annual", price: "$200", per: "/year", withCode: "Join today and save $20. Get your first year of Marquee for just $180." },
] as const;
type PlanKey = (typeof PLANS)[number]["key"];
type View = "join" | "request" | "requested";

const WRONG = "That code doesn't match our records. Check for typos and try again, or email hello@marquee.bio.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Join() {
  const [view, setView] = useState<View>("join");
  const [plan, setPlan] = useState<PlanKey>("founding_yearly");
  // a friend's referral code from the link; kept for the visit so it survives a look around the site
  const [ref, setRef] = useState("");
  // the invite code (a Stripe discount code): typed in the box or carried in the link. Applied at checkout.
  const [promo, setPromo] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const fromUrl = q.get("ref") || "";
      const code = (fromUrl || localStorage.getItem("mq_ref") || "").trim().toLowerCase();
      if (code) { setRef(code); localStorage.setItem("mq_ref", code); }
      const p = (q.get("promo") || q.get("code") || localStorage.getItem("mq_promo") || "").trim().toUpperCase().slice(0, 60);
      if (p) { setPromo(p); setPlan("founding_monthly"); localStorage.setItem("mq_promo", p); }
      if (q.get("request") === "1") setView("request");
    } catch { /* storage blocked */ }
  }, []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [closed, setClosed] = useState<"" | "notOpen" | "full">("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  // the request form
  const [rq, setRq] = useState({ name: "", email: "", linkedin: "", website_url: "" });
  const [rqErr, setRqErr] = useState("");

  const applyCode = async (e: React.FormEvent) => {
    e.preventDefault(); setCodeErr("");
    const code = codeInput.trim().toUpperCase();
    if (!code) { setCodeErr("Enter your code."); return; }
    setChecking(true);
    try {
      const r = await fetch("/api/code-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const j = await r.json().catch(() => ({}));
      if (j.legacy) { window.location.href = "/signup"; return; }
      if (!r.ok || !j.promo) { setCodeErr(j.error || WRONG); setChecking(false); return; }
      setPromo(j.promo); setPlan("founding_monthly"); setCodeInput("");
      try { localStorage.setItem("mq_promo", j.promo); } catch { /* storage blocked */ }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setCodeErr("We couldn't reach Marquee. Please try again."); }
    setChecking(false);
  };
  const clearCode = () => { setPromo(""); setPlan("founding_yearly"); try { localStorage.removeItem("mq_promo"); } catch { /* ignore */ } };

  const pay = async () => {
    setErr(""); setBusy(true);
    try {
      // the affiliate who sent them, if any: Affonso stores it in a cookie when they land through an affiliate link
      const affonso = (document.cookie.match(/(?:^|; )affonso_referral=([^;]*)/) || [])[1] || "";
      const r = await fetch("/api/membership/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, ref, promo, affonso: decodeURIComponent(affonso) }) });
      const j = await r.json();
      if (j.url) {
        // the code was checked again on the server; if it no longer works, say so instead of charging full price
        if (promo && !j.promoApplied) { clearCode(); setErr(WRONG); setBusy(false); return; }
        window.location.href = j.url; return;
      }
      if (j.notOpen) setClosed("notOpen"); else if (j.full) setClosed("full"); else setErr(j.error || "We couldn't start the payment. Please try again.");
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };
  const request = async (e: React.FormEvent) => {
    e.preventDefault(); setRqErr("");
    if (!rq.name.trim() || !rq.email.trim() || !rq.linkedin.trim()) { setRqErr("Please add your name, email and LinkedIn profile."); return; }
    if (!EMAIL.test(rq.email.trim())) { setRqErr("That email address doesn't look right."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/beta-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rq) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setView("requested"); window.scrollTo({ top: 0 }); } else setRqErr(j.error || "We couldn't send that. Please try again.");
    } catch { setRqErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };
  const notify = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (!EMAIL.test(email.trim())) { setErr("Please enter a valid email address."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, about: closed === "full" ? "pro-dec-1" : "founding" }) });
      if (r.ok) setSaved(true); else setErr((await r.json()).error || "We couldn't save that. Please try again.");
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };

  const input = "w-full rounded-full border-[1.5px] border-hair bg-white px-5 py-[12px] text-[15px] focus:outline-none focus:border-ink";
  const label = "block text-[11px] font-semibold tracking-[0.18em] uppercase text-ink/60 mb-[6px]";
  const redBtn = "block w-full px-6 py-[15px] text-[16px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50";

  return (
    <main className="min-h-screen bg-beige font-inter text-ink px-5 py-10">
      <div className="max-w-[560px] mx-auto">
        <Link href="/" className="block text-[16.5px] font-medium tracking-[0.26em] mb-10">MARQUEE</Link>
        {!closed && <span className="inline-block text-[11.5px] font-bold tracking-[0.16em] uppercase px-[13px] py-[7px] rounded-full bg-dred text-white">Private beta · Open now</span>}

        {closed ? (
          <>
            <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Join Marquee.</h1>
            <div className="bg-white border border-hair rounded-[10px] p-7 mt-8">
              <h2 className="font-lora text-[24px] leading-[1.2]">{closed === "full" ? "Founding Member places are all taken." : "Founding Member sign-up opens shortly."}</h2>
              {saved ? <p className="text-[15px] leading-[1.55] mt-3 font-semibold text-dred" role="status">Got it. We&apos;ll email you{closed === "full" ? " when Marquee Pro opens on December 1" : " the moment it opens"}.</p> : (
                <form onSubmit={notify} noValidate>
                  <p className="text-[15px] leading-[1.55] mt-3">{closed === "full" ? "Marquee Pro opens December 1. Leave your email and we'll remind you." : "Leave your email and we'll send your link the moment it opens."}</p>
                  <label htmlFor="join-email" className="sr-only">Your email address</label>
                  <input id="join-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className={`${input} mt-4`} />
                  <button type="submit" disabled={busy} className="block w-full mt-3 px-6 py-[13px] text-[15px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Saving…" : closed === "full" ? "Remind Me" : "Tell me when it opens"}</button>
                </form>
              )}
              {err && <p className="text-[13px] text-dred mt-2" role="alert">{err}</p>}
            </div>
          </>
        ) : view === "request" ? (
          <>
            <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Request your invite code.</h1>
            <p className="text-[16px] leading-[1.55] mt-4">Tell us a little about yourself to request a code and get your first month free.</p>
            <form onSubmit={request} noValidate className="mt-7 space-y-4">
              <div><label htmlFor="rq-name" className={label}>Name</label><input id="rq-name" type="text" autoComplete="name" value={rq.name} onChange={(e) => setRq({ ...rq, name: e.target.value })} className={input} /></div>
              <div><label htmlFor="rq-email" className={label}>Email</label><input id="rq-email" type="email" autoComplete="email" value={rq.email} onChange={(e) => setRq({ ...rq, email: e.target.value })} className={input} /></div>
              <div><label htmlFor="rq-li" className={label}>LinkedIn profile</label><input id="rq-li" type="url" autoComplete="url" inputMode="url" placeholder="linkedin.com/in/yourname" value={rq.linkedin} onChange={(e) => setRq({ ...rq, linkedin: e.target.value })} className={input} /></div>
              <input type="text" name="website_url" value={rq.website_url} onChange={(e) => setRq({ ...rq, website_url: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {rqErr && <p className="text-[13px] text-dred" role="alert">{rqErr}</p>}
              <button type="submit" disabled={busy} className={`${redBtn} !mt-6`}>{busy ? "Sending…" : "Request My Code"}</button>
              <p className="text-[13px] leading-[1.55] text-ink/70 text-center">We review every request and respond within 24 hours.</p>
            </form>
            <p className="text-[13px] mt-8 text-center"><button onClick={() => setView("join")} className="underline underline-offset-2 hover:text-dred">Already have a code? Enter it here.</button></p>
          </>
        ) : view === "requested" ? (
          <>
            <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Your request is in!</h1>
            <p className="text-[16px] leading-[1.55] mt-4" role="status">We&apos;ll email you when your code is ready.</p>
            <p className="text-[13px] mt-8"><button onClick={() => setView("join")} className="underline underline-offset-2 hover:text-dred">Already have a code? Enter it here.</button></p>
          </>
        ) : (
          <>
            {promo ? (
              <>
                <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Welcome to Marquee!</h1>
                <p className="text-[16px] leading-[1.55] mt-4">Your code has been applied. Enjoy your first month free.</p>
                <p className="text-[13px] text-ink/70 mt-2">Code <b className="text-ink">{promo}</b> · <button onClick={clearCode} className="underline underline-offset-2 hover:text-dred">use a different code</button></p>
              </>
            ) : (
              <>
                <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Join Marquee.</h1>
                <p className="text-[16px] leading-[1.55] mt-4">Enter your invite code to get your first month free and access Founding Member pricing.</p>
                <form onSubmit={applyCode} noValidate className="mt-7">
                  <label htmlFor="join-code" className="sr-only">Your code</label>
                  <input id="join-code" type="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={codeInput} onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodeErr(""); }} placeholder="Enter your code" className={`${input} tracking-[0.06em]`} />
                  {codeErr && <p className="text-[13px] leading-[1.5] text-dred mt-3" role="alert">{codeErr}</p>}
                  <button type="submit" disabled={checking} className={`${redBtn} mt-3`}>{checking ? "Checking…" : "Apply Code"}</button>
                </form>
                <div className="mt-7 bg-white border border-hair rounded-[10px] p-5 text-center">
                  <p className="text-[15px] font-semibold">Don&apos;t have a code?</p>
                  <p className="text-[14px] leading-[1.55] text-ink/80 mt-1">Request access to the private beta and get your first month free, plus Founding Member pricing of $20/month or $200/year.</p>
                  <button type="button" onClick={() => { setView("request"); window.scrollTo({ top: 0 }); }} className="inline-block mt-4 px-6 py-[11px] rounded-full font-semibold text-[14px] border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white transition-colors">Request Access</button>
                </div>
              </>
            )}

            {promo && (<>
            <fieldset className="mt-8">
              <legend className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred mb-3">Choose your plan</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANS.map((p) => (
                  <label key={p.key} className={`block bg-white rounded-[10px] p-5 cursor-pointer border-[1.5px] ${plan === p.key ? "border-dred shadow-[0_10px_26px_rgba(124,18,38,0.12)]" : "border-hair hover:border-ink"}`}>
                    <span className="flex items-center gap-2"><input type="radio" name="plan" value={p.key} checked={plan === p.key} onChange={() => setPlan(p.key)} className="accent-[#7C1226]" /><span className="text-[14.5px] font-semibold">{p.name}</span></span>
                    <span className="block mt-3"><span className="font-lora text-[34px] leading-none">{p.price}</span><span className="text-[14px] text-dred"> {p.per}</span></span>
                    <span className="block text-[13px] leading-[1.45] text-ink/70 mt-3">{p.withCode}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button onClick={pay} disabled={busy} className={`${redBtn} mt-6`}>{busy ? "Opening secure payment…" : "Continue to Payment"}</button>
            {err && <p className="text-[13px] text-dred mt-3 text-center" role="alert">{err}</p>}
            <p className="text-[13px] leading-[1.55] text-ink/70 mt-4 text-center">You&apos;ll enter your payment information securely through Stripe. Cancel anytime.</p>
            <p className="text-[12.5px] leading-[1.55] text-ink/60 mt-3 text-center">By continuing, you agree to Marquee&apos;s <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-dred">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-dred">Privacy Policy</Link>.</p>
            </>)}
          </>
        )}
        <p className="text-[13px] mt-10 text-center">Already a member? <Link href="/login" className="underline underline-offset-2 hover:text-dred">Sign in</Link></p>
      </div>
    </main>
  );
}
