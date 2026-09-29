"use client";
// Founding Member sign-up: choose monthly or annual, pay, then create the account.

import { useState } from "react";
import Link from "next/link";
import { foundingSaving } from "@/lib/membership";

const PLANS = [
  { key: "founding_monthly", name: "Monthly", price: "$20", per: "/month", note: "Billed every month." },
  { key: "founding_yearly", name: "Annual", price: "$200", per: "/year", note: "Billed once a year. $40 less than paying monthly." },
] as const;

export default function Join() {
  const [plan, setPlan] = useState<(typeof PLANS)[number]["key"]>("founding_yearly");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [closed, setClosed] = useState<"" | "notOpen" | "full">("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const pay = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/membership/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      if (j.notOpen) setClosed("notOpen"); else if (j.full) setClosed("full"); else setErr(j.error || "We couldn't start the payment. Please try again.");
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };
  const notify = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr("Please enter a valid email address."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, about: closed === "full" ? "pro-dec-1" : "founding" }) });
      if (r.ok) setSaved(true); else setErr((await r.json()).error || "We couldn't save that. Please try again.");
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-beige font-inter text-ink px-5 py-10">
      <div className="max-w-[560px] mx-auto">
        <Link href="/" className="block text-[16.5px] font-medium tracking-[0.26em] mb-10">MARQUEE</Link>
        {!closed && <span className="inline-block text-[11.5px] font-bold tracking-[0.16em] uppercase px-[13px] py-[7px] rounded-full bg-dred text-white">Private beta · Open now</span>}
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-5">Become a Founding Member.</h1>
        <p className="text-[16px] leading-[1.55] mt-4">Full access to Marquee Pro now, at a price that stays locked for as long as your membership stays active.</p>

        {closed ? (
          <div className="bg-white border border-hair rounded-[10px] p-7 mt-8">
            <h2 className="font-lora text-[24px] leading-[1.2]">{closed === "full" ? "All 250 Founding Member places are taken." : "Founding Member sign-up opens shortly."}</h2>
            {saved ? <p className="text-[15px] leading-[1.55] mt-3 font-semibold text-dred" role="status">Got it. We&apos;ll email you{closed === "full" ? " when Marquee Pro opens on December 1" : " the moment it opens"}.</p> : (
              <form onSubmit={notify} noValidate>
                <p className="text-[15px] leading-[1.55] mt-3">{closed === "full" ? "Marquee Pro opens December 1. Leave your email and we'll remind you." : "Leave your email and we'll send your link the moment it opens."}</p>
                <label htmlFor="join-email" className="sr-only">Your email address</label>
                <input id="join-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="w-full rounded-full border-[1.5px] border-hair bg-white px-5 py-[12px] text-[15px] mt-4 focus:outline-none focus:border-ink" />
                <button type="submit" disabled={busy} className="block w-full mt-3 px-6 py-[13px] text-[15px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Saving…" : closed === "full" ? "Remind Me" : "Tell me when it opens"}</button>
              </form>
            )}
            {err && <p className="text-[13px] text-dred mt-2" role="alert">{err}</p>}
          </div>
        ) : (
          <>
            <fieldset className="mt-8">
              <legend className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred mb-3">Choose your billing</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANS.map((p) => { const s = foundingSaving(p.key); return (
                  <label key={p.key} className={`block bg-white rounded-[10px] p-5 cursor-pointer border-[1.5px] ${plan === p.key ? "border-dred shadow-[0_10px_26px_rgba(124,18,38,0.12)]" : "border-hair hover:border-ink"}`}>
                    <span className="flex items-center gap-2"><input type="radio" name="plan" value={p.key} checked={plan === p.key} onChange={() => setPlan(p.key)} className="accent-[#7C1226]" /><span className="text-[14.5px] font-semibold">{p.name}</span></span>
                    <span className="block mt-3"><span className="font-lora text-[34px] leading-none">{p.price}</span><span className="text-[14px] text-dred"> {p.per}</span></span>
                    <span className="block text-[13px] leading-[1.45] text-ink/70 mt-2">Marquee Pro will be <s>${s.proDollars}{p.per}</s></span>
                    <span className="inline-block text-[12.5px] font-bold leading-none bg-dred text-white rounded-full px-[11px] py-[7px] mt-3">{s.percent}% off · Save ${s.yearDollars} a year</span>
                    <span className="block text-[13px] leading-[1.45] text-ink/70 mt-3">{p.note}</span>
                  </label>
                ); })}
              </div>
            </fieldset>
            <button onClick={pay} disabled={busy} className="block w-full mt-6 px-6 py-[15px] text-[16px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Opening secure payment…" : "Continue to payment"}</button>
            {err && <p className="text-[13px] text-dred mt-3 text-center" role="alert">{err}</p>}
            <p className="text-[13px] leading-[1.55] text-ink/70 mt-4 text-center">You&apos;ll pay on Stripe&apos;s secure page, then create your account. Cancel anytime.</p>
            <p className="text-[13px] leading-[1.55] text-ink/70 mt-6 text-center">For professionals with 5+ years of experience. Limited to 250 Founding Members.</p>
          </>
        )}
        <p className="text-[13px] mt-10 text-center"><Link href="/signup" className="underline underline-offset-2 hover:text-dred">Have an invite code?</Link> &nbsp;·&nbsp; <Link href="/login" className="underline underline-offset-2 hover:text-dred">Sign in</Link></p>
      </div>
    </main>
  );
}
