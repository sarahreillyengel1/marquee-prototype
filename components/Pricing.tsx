"use client";
// The pricing section: join now as a Founding Member, or be reminded when Marquee Pro opens.
// Marquee Pro (Remind Me) comes first; Founding Member is the emphasized card because it is the one available today.

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

export default function Pricing({ mode = "full" }: { mode?: "home" | "full" }) {
  // Both cards share one set of rows (tag, name, price, description, list, action), so every
  // part lines up across the two and the cards are exactly the same size.
  const CARD = "row-span-6 grid [grid-template-rows:subgrid] gap-0 rounded-[10px] border p-[34px_30px] sm:p-[40px_36px]";
  const TOP = "h-[50px] flex items-center justify-center text-center"; // the slot above each button: same height in both cards
  return (
    <div className={mode === "home" ? "mt-11 max-w-[760px] mx-auto text-left" : "grid md:grid-cols-2 gap-x-[22px] gap-y-0 max-md:gap-y-[22px] mt-11 max-w-[980px] mx-auto text-left"}>
      {/* FOUNDING MEMBER — open now */}
      <div className={mode === "home" ? "rounded-[14px] border border-beigeLine bg-beige text-ink p-[34px_30px] sm:p-[44px_48px]" : `${CARD} bg-dred text-white border-dred shadow-[0_22px_50px_rgba(124,18,38,0.22)]`}>
        <div><span className={`${TAG} ${mode === "home" ? "bg-[#C7B5FF] text-ink" : "bg-white text-dred"}`}>Private beta · Open now</span></div>
        <h3 className={`${H3} mt-5`}>Founding Member</h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-lora text-[clamp(38px,5vw,54px)] leading-none">$20</span><span className={`text-[15px] ${mode === "home" ? "text-dred" : "text-white/85"}`}>/month</span>
          <span className={`text-[15px] ${mode === "home" ? "text-dred" : "text-white/85"}`}>or $200/year</span>
        </div>
        <div className="mt-4">
          <p className="text-[15px] font-semibold">Lock in ~30% off Marquee Pro.</p>
          <p className={`text-[14.5px] leading-[1.55] mt-2 ${mode === "home" ? "text-ink/80" : "text-white/90"}`}>Join the first professionals on Marquee. Get full access to Marquee Pro now, plus:</p>
        </div>
        <ul className="list-none mt-4 mb-7">
          {FOUNDING.map((l) => <li key={l} className={`text-[14.5px] leading-[1.45] py-[10px] border-b last:border-0 ${mode === "home" ? "border-beigeLine" : "border-white/20"}`}>{l}</li>)}
        </ul>
        <div className={mode === "home" ? "text-center" : ""}>
          <p className={`${TOP} text-[12.5px] leading-[1.45] ${mode === "home" ? "text-ink/70" : "text-white/85"}`}>Access is limited.</p>
          <Link href="/join" className={`${BTN} ${mode === "home" ? "bg-dred text-white hover:bg-ink inline-block mx-auto px-9" : "bg-white text-dred hover:bg-beige block w-full"} mt-3`}>Claim Yours &rarr;</Link>
        </div>
      </div>
      {/* MARQUEE PRO — after the beta */}
      {mode === "full" && <div className={`${CARD} bg-white border-hair`}>
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
        <div>
          <div className={TOP} />
          <p className="text-[13px] leading-[1.45] text-ink/70 text-center py-[13px]">Available when the beta closes.</p>
        </div>
      </div>}

    </div>
  );
}
