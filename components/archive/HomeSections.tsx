"use client";
// ARCHIVED home page sections, kept word for word and style for style so they can come back.
// Taken off marquee.bio on Oct 17 2026 at Sarah's request. Not imported anywhere.
//   <BusinessSection onJoin={() => ...} />   "For businesses & recruiters" (blue)
//   <ProfessionalStackSection />             "The professional stack" (white), uses /public/images/marquee-stack-graphic.png

import Link from "next/link";
import Image from "next/image";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const SECTION = "py-[clamp(32px,6vw,104px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(23px,4vw,42px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";
const SCRIPT = "font-script leading-none text-[clamp(23px,5vw,44px)]";
const LEDE = "text-[clamp(15px,2vw,18px)] leading-[1.55]";
const BTN = "inline-block px-5 py-[10px] text-[13.5px] sm:px-6 sm:py-[13px] sm:text-[15px] rounded-full font-semibold text-center border-[1.5px] border-transparent transition-colors";

const BIZ = [
  ["Superpowers over resumes", "Surface proven execution speed, practical expertise, and core strengths."],
  ["Driven by forward-looking signals", "Traditional platforms focus on past job titles. Marquee shows active goals, real-time bandwidth, and current focus areas."],
  ["Flexible work formats", "Connect with top talent for fractional leadership, project work, advisory roles, speaking engagements, content partnerships, and board seats."],
  ["Cultural alignment first", "Filter by leadership style, public presence, and shared core values to ensure lasting, high-impact partnerships."],
  ["Direct contact with upfront insights", "View rates, explicit availability, and preferred engagement formats so you can reach out directly."],
];

export function BusinessSection({ onJoin }: { onJoin: () => void }) {
  return (
    <section id="business" className={`${SECTION} bg-blue`}>
      <div className={`${WRAP} grid md:grid-cols-[.9fr_1.1fr] gap-[clamp(30px,5vw,64px)] items-start`}>
        <div>
          <div className={EYEBROW}>For businesses &amp; recruiters</div>
          <h2 className={`${H2} mt-4`}>Discover the human beyond the title.</h2>
          <p className={`${LEDE} mt-4`}>Search by skills, superpowers, core values, leadership style, industry experience and impact.</p>
          <div className="mt-8"><button onClick={onJoin} className={`${BTN} bg-dred text-white hover:bg-red`}>Join the waitlist</button></div>
        </div>
        <div>
          {BIZ.map(([b, s]) => (
            <div key={b} className="py-[18px] border-b border-hair last:border-0">
              <b className="block text-[16.5px] mb-[5px]">{b}</b>
              <span className="text-[15px] leading-[1.55]">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfessionalStackSection() {
  return (
    <section className={SECTION}>
      <div className={`${WRAP} text-center`}>
        <div className={EYEBROW}>The professional stack</div>
        <h2 className={`${H2} mt-4 max-w-[960px] mx-auto`}>Your work lives everywhere. Your full story lives nowhere.</h2>
        <p className={`${LEDE} mt-[18px] max-w-[860px] mx-auto`}>Professionals are missing out on income, visibility, and high-impact opportunities because their identity is scattered across multiple tools. When the world only sees disconnected fragments of what you do, no single place captures your true capabilities, your full story, or how to work with you today.</p>
        <div className="mx-auto max-w-[720px] overflow-hidden mt-4" style={{ aspectRatio: "740 / 545" }}>
          <Image src="/images/marquee-stack-graphic.png" alt="A professional surrounded by the disconnected tools their identity is scattered across: LinkedIn, resume, personal website, newsletter, link in bio, portfolio, speaking, advisory, booking, products, projects, and media mentions." width={740} height={740} className="w-full h-auto block" priority />
        </div>
        <div className="text-[30px] text-dred leading-none mt-4 mb-6">↓</div>
        <Link href="/join" className={`${BTN} bg-red text-white hover:bg-dred sm:text-[17px] sm:!px-[34px] sm:!py-[18px]`}>Get one link for your professional story</Link>
        <div className={`${SCRIPT} text-dred mt-5`}>marquee.bio/yourname</div>
      </div>
    </section>
  );
}
