"use client";
// The pricing section: join now as a Founding Member, or be reminded when Marquee Pro opens.
// Marquee Pro (Remind Me) comes first; Founding Member is the emphasized card because it is the one available today.

import { useState } from "react";
import Link from "next/link";

const H3 = "font-lora font-normal leading-[1.15] text-[clamp(18px,3vw,27px)]";
const BTN = "inline-block px-6 py-[13px] text-[15px] rounded-full font-semibold text-center border-[1.5px] border-transparent transition-colors";
const TAG = "inline-block text-[11.5px] font-bold tracking-[0.16em] uppercase px-[13px] py-[7px] rounded-full";

const PRO = [
  "Your own marquee.bio/username",
  "Showcase your experience, impact, skills, work and media",
  "Get hired for full-time, fractional, consulting and advisory work",
  "Offer projects, speaking, coaching and 1:1 calls",
  "Set your rates and availability and get paid through Marquee",
  "Sell workshops, courses and downloads from your storefront",
  "Get discovered, booked and hired by businesses and professionals",
];
const FOUNDING = [
  "Founding Member pricing, locked in",
  "Founding Member badge on your profile",
  "Priority visibility in search and discovery",
  "Priority consideration for featured talent, editorial and social",
  "Private monthly member calls and guest conversations",
  "First access to new features",
  "Direct influence on the product roadmap",
];

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"" | "sending" | "done">("");
  const [err, setErr] = useState("");

  const remind = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr("Please enter a valid email address."); return; }
    setState("sending");
    try {
      const r = await fetch("/api/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, about: "pro-dec-1" }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "We couldn't save that. Please try again."); setState(""); return; }
      setState("done");
    } catch { setErr("We couldn't reach Marquee. Please try again."); setState(""); }
  };

  // Both cards share one set of rows (tag, name, price, description, list, action), so every
  // part lines up across the two and the cards are exactly the same size.
  const CARD = "row-span-6 grid [grid-template-rows:subgrid] gap-0 rounded-[10px] border p-[34px_30px] sm:p-[40px_36px]";
  const TOP = "h-[50px] flex items-center justify-center text-center"; // the slot above each button: same height in both cards
  return (
    <div className="grid md:grid-cols-2 gap-x-[22px] gap-y-0 max-md:gap-y-[22px] mt-11 max-w-[980px] mx-auto text-left">
      {/* MARQUEE PRO — opens December 1 */}
      <div className={`${CARD} bg-white border-hair`}>
        <div><span className={`${TAG} bg-ink text-white`}>Opens December 1</span></div>
        <h3 className={`${H3} mt-5`}>Marquee Pro</h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-lora text-[clamp(38px,5vw,54px)] leading-none">$29</span><span className="text-[15px] text-dred">/month</span>
          <span className="text-[15px] text-dred">or $279/year · Save 20%</span>
        </div>
        <div className="mt-4">
          <p className="text-[14.5px] leading-[1.55]">Build your professional identity, launch your storefront and get discovered — all in one place.</p>
        </div>
        <ul className="list-none mt-4 mb-7">
          {PRO.map((l) => <li key={l} className="text-[14.5px] leading-[1.45] py-[10px] border-b border-hair last:border-0">{l}</li>)}
        </ul>
        {state === "done" ? (
          <div>
            <div className={TOP} />
            <p className="text-[15px] leading-[1.35] font-semibold text-dred text-center mt-3 py-[13px] border-[1.5px] border-transparent" role="status">You&apos;re on the list. We&apos;ll email you on December 1.</p>
          </div>
        ) : (
          <form onSubmit={remind} noValidate>
            <label htmlFor="remind-email" className="sr-only">Your email address</label>
            <input id="remind-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="w-full h-[50px] rounded-full border-[1.5px] border-hair bg-white px-5 text-[15px] focus:outline-none focus:border-ink" />
            <button type="submit" disabled={state === "sending"} className={`${BTN} !border-ink text-ink hover:bg-ink hover:text-white block w-full mt-3 disabled:opacity-50`}>{state === "sending" ? "Saving…" : "Remind Me"}</button>
            {err && <p className="text-[13px] text-dred mt-2 text-center" role="alert">{err}</p>}
          </form>
        )}
      </div>

      {/* FOUNDING MEMBER — open now */}
      <div className={`${CARD} bg-dred text-white border-dred shadow-[0_22px_50px_rgba(124,18,38,0.22)]`}>
        <div><span className={`${TAG} bg-white text-dred`}>Private beta · Open now</span></div>
        <h3 className={`${H3} mt-5`}>Founding Member</h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-lora text-[clamp(38px,5vw,54px)] leading-none">$20</span><span className="text-[15px] text-white/85">/month</span>
          <span className="text-[15px] text-white/85">or $200/year</span>
        </div>
        <div className="mt-4">
          <p className="text-[15px] font-semibold">Lock in ~30% off Marquee Pro.</p>
          <p className="text-[14.5px] leading-[1.55] text-white/90 mt-2">Join the first professionals on Marquee. Get full access to Marquee Pro now, plus:</p>
        </div>
        <ul className="list-none mt-4 mb-7">
          {FOUNDING.map((l) => <li key={l} className="text-[14.5px] leading-[1.45] py-[10px] border-b border-white/20 last:border-0">{l}</li>)}
        </ul>
        <div>
          <p className={`${TOP} text-[12.5px] leading-[1.45] text-white/85`}>Access is limited.</p>
          <Link href="/join" className={`${BTN} bg-white text-dred hover:bg-beige block w-full mt-3`}>Sign Up Now</Link>
        </div>
      </div>
    </div>
  );
}
