"use client";

// Professional profile view — mockup for the investor deck.
// Brand-correct. Leads with the storefront (revenue) + forward intent + proof density.

import { Logo } from "@/components/Logo";

const OPEN_TO = [
  { t: "Advisory", r: "$300 / hr", cta: "Book" },
  { t: "Fractional", r: "from $8k / mo", cta: "Proposal" },
  { t: "Office Hours", r: "$350 · book instantly", cta: "Book" },
  { t: "Speaking", r: "Contact", cta: "Message" },
];
const STATS = [{ n: "20+", l: "Years experience" }, { n: "$100M+", l: "Programs managed" }, { n: "1.5M+", l: "Community members" }];
const HIGHLIGHTS = [
  { tag: "Experience", t: "Scaled Hello Alice to 1.5M members", s: "VP Marketing · Series A → C" },
  { tag: "Impact", t: "3.2× pipeline in 18 months", s: "Repositioned Meridian around AI" },
  { tag: "Press", t: "Named a Top 50 PM Influencer", s: "2024" },
];
const ARCH = [
  { t: "The Strategist", d: "Vision, direction, and outside-the-box thinking." },
  { t: "The Builder", d: "Turns ideas into real things with determination." },
  { t: "The Coach", d: "Gets the best out of people, builds culture." },
];
const SKILLS = [["Go-to-Market", 95], ["Brand & Positioning", 92], ["Growth", 90], ["Community", 88], ["AI & Automation", 80]] as const;
const VALUES = ["Directness", "Ownership", "Curiosity", "Integrity"];
const MEDIA = [
  { k: "PODCAST", t: "Building Communities That Scale", s: "Masters of Scale" },
  { k: "ARTICLE", t: "The Future of Brand in the AI Era", s: "Forbes" },
  { k: "SPEAKING", t: "AI & The Next Chapter of Marketing", s: "SaaStr 2024" },
  { k: "VIDEO", t: "Inside Hello Alice", s: "YouTube" },
];

export default function ProfilePreview() {
  return (
    <div className="font-inter text-brand-ink bg-brand-paper min-h-screen">
      {/* public top bar */}
      <header className="border-b border-[#ECEAE4] px-8 h-[64px] flex items-center bg-white sticky top-0 z-10">
        <div className="text-[18px]"><Logo /></div>
        <nav className="ml-10 flex gap-8 font-poppins text-[13px] text-[#3a352f]">
          <span>Profile</span><span>Experience</span><span>How I Work</span><span>Media</span>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button className="font-poppins border border-[#E1DED7] text-[13px] py-[8px] px-[16px]">Share</button>
          <button className="font-poppins bg-brand-ink text-white text-[13px] font-medium py-[8px] px-[18px]">Work with Ava</button>
        </div>
      </header>

      <div className="max-w-[1120px] mx-auto px-8 py-10">
        {/* HERO */}
        <section className="grid gap-8" style={{ gridTemplateColumns: "1fr 300px" }}>
          <div className="flex gap-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/240?img=5" alt="" className="w-[150px] h-[150px] object-cover flex-none" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-poppins text-[38px] font-semibold tracking-[-0.02em] leading-none">Ava Bennett</h1>
                <span className="text-[#6B4BD6] text-[18px]">✓</span>
              </div>
              <div className="font-poppins text-[13px] font-medium text-[#6B4BD6] uppercase tracking-[0.05em] mt-2">GTM Leader · Brand Builder · AI Operator</div>
              <p className="text-[15px] text-[#3a352f] mt-3 max-w-[46ch] leading-relaxed">I build systems, brands, and communities that drive growth and create lasting impact.</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#7d7a74] mt-4">
                <span>📍 Westport, CT</span><span>20+ years</span><span>Remote</span>
                <span className="inline-flex items-center gap-1.5 text-[#3c5233]"><span className="w-[7px] h-[7px] rounded-full bg-[#73926A]" /> Open now</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                {["Go-to-Market", "Brand Strategy", "Community", "AI"].map((t) => <span key={t} className="font-poppins text-[12px] py-[5px] px-[11px] bg-white border border-[#E1DED7]">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Work With Me — the storefront */}
          <aside className="border border-[#E1DED7] p-5 self-start">
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-3">Work with me</div>
            {OPEN_TO.map((o) => (
              <div key={o.t} className="flex items-center justify-between py-[9px] border-t border-[#ECEAE4] first:border-t-0">
                <div><div className="font-poppins text-[13.5px] font-semibold">{o.t}</div><div className="text-[11.5px] text-[#7d7a74]">{o.r}</div></div>
                <span className="font-poppins text-[11px] text-[#6B4BD6] font-medium">{o.cta} →</span>
              </div>
            ))}
            <button className="w-full mt-3 bg-brand-ink text-white font-poppins text-[12.5px] font-medium py-[10px]">Work with Ava</button>
          </aside>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-3 gap-4 mt-10">
          {STATS.map((s, i) => (
            <div key={i} className={`p-5 ${i === 1 ? "bg-brand-ink text-white" : i === 2 ? "bg-[#C0DDFB]" : "bg-[#E6E2D0]"}`}>
              <div className="font-poppins text-[34px] font-semibold leading-none">{s.n}</div>
              <div className="font-poppins text-[12px] mt-2 opacity-90">{s.l}</div>
            </div>
          ))}
        </section>

        {/* HIGHLIGHTS */}
        <SectionHead t="Highlights" />
        <div className="grid grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.t} className="border border-[#E1DED7] p-5 bg-white">
              <span className="font-poppins text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#6B4BD6] bg-[#F2EEFF] py-[2px] px-[7px]">{h.tag}</span>
              <div className="font-poppins text-[16px] font-semibold mt-3 leading-snug">{h.t}</div>
              <div className="text-[12px] text-[#7d7a74] mt-1">{h.s}</div>
            </div>
          ))}
        </div>

        {/* FEATURED EXPERIENCE */}
        <SectionHead t="Featured Experience" link="View all experience" />
        <div className="grid gap-6 border border-[#E1DED7] bg-white overflow-hidden" style={{ gridTemplateColumns: "1fr 300px" }}>
          <div className="p-7">
            <div className="flex items-center gap-2 text-[12px] text-[#7d7a74]"><span className="w-[28px] h-[28px] bg-[#EAF0E7] text-[#254B18] flex items-center justify-center font-poppins font-semibold text-[13px]">H</span> Hello Alice</div>
            <div className="font-poppins text-[24px] font-semibold mt-3">VP Marketing</div>
            <div className="text-[13px] text-[#7d7a74] mt-1">2016 – 2018</div>
            <p className="text-[14px] text-[#3a352f] mt-3 leading-relaxed max-w-[52ch]">Led brand, product marketing and community strategy through Series A and scaled the platform to over 1.5M members.</p>
            <div className="flex gap-2 mt-4">{["Series A", "Brand Strategy", "Growth", "Community"].map((t) => <span key={t} className="font-poppins text-[11.5px] py-[4px] px-[10px] bg-[#F4F2EF]">{t}</span>)}</div>
            <div className="font-poppins text-[12.5px] text-[#6B4BD6] font-medium mt-5">Read the full story →</div>
          </div>
          <div style={{ background: "radial-gradient(120% 130% at 78% 18%, #C7B5EE, #2E2C28 68%, #241F1A)" }} />
        </div>

        {/* HOW I WORK + LEADERSHIP */}
        <div className="grid grid-cols-2 gap-10 mt-12">
          <div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-4">How I Work</div>
            {ARCH.map((a) => (
              <div key={a.t} className="flex gap-3 py-3 border-b border-[#ECEAE4] last:border-0">
                <span className="w-[30px] h-[30px] bg-[#F2EEFF] text-[#6B4BD6] flex items-center justify-center flex-none">◆</span>
                <div><div className="font-poppins text-[14px] font-semibold">{a.t}</div><div className="text-[12.5px] text-[#7d7a74]">{a.d}</div></div>
              </div>
            ))}
          </div>
          <div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-4">Leadership Snapshot</div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[["20", "Years leading"], ["50", "Largest team"], ["5", "Organizations"]].map(([n, l]) => (
                <div key={l}><div className="font-poppins text-[24px] font-semibold">{n}</div><div className="text-[11px] text-[#7d7a74]">{l}</div></div>
              ))}
            </div>
            <div className="bg-[#F4F2EF] p-4 text-[13px] text-[#3a352f] leading-relaxed italic">&ldquo;I build high-performing teams through clarity, trust, and a bias for action.&rdquo;</div>
          </div>
        </div>

        {/* SUPERPOWERS + SKILLS + VALUES */}
        <div className="grid grid-cols-3 gap-10 mt-12">
          <div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-4">Superpowers</div>
            {["Community Building", "Storytelling", "0 → 1 Building"].map((s) => <div key={s} className="font-poppins text-[15px] font-semibold py-2 border-b border-[#ECEAE4] last:border-0">{s}</div>)}
          </div>
          <div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-4">Skills</div>
            {SKILLS.map(([n, v]) => (
              <div key={n} className="mb-2.5"><div className="flex justify-between text-[12px] mb-1"><span className="font-medium">{n}</span><span className="text-[#7d7a74]">{v}</span></div><div className="h-[6px] bg-[#F0EEE9]"><div className="h-full" style={{ width: `${v}%`, background: "linear-gradient(90deg,#C7B5EE,#6B4BD6)" }} /></div></div>
            ))}
          </div>
          <div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-4">Values</div>
            <div className="flex flex-wrap gap-2">{VALUES.map((v) => <span key={v} className="font-poppins text-[13px] py-[6px] px-[12px] bg-brand-ink text-white">{v}</span>)}</div>
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7d7a74] mb-3 mt-8">What people say</div>
            <div className="text-[13px] text-[#3a352f] italic leading-relaxed">&ldquo;Ava is one of the most strategic leaders I&apos;ve worked with. She sees around corners.&rdquo;</div>
            <div className="text-[12px] text-[#7d7a74] mt-2">Jason Lemkin · Founder, SaaStr</div>
          </div>
        </div>

        {/* MEDIA */}
        <SectionHead t="Media" link="View all media" />
        <div className="grid grid-cols-4 gap-4">
          {MEDIA.map((m, i) => (
            <div key={m.t} className="p-4 min-h-[150px] flex flex-col justify-end text-white" style={{ background: ["radial-gradient(120% 130% at 20% 12%, #4b3a7a, #1a1524)", "radial-gradient(120% 130% at 78% 18%, #2b4a6f, #141c28)", "radial-gradient(120% 130% at 30% 80%, #5a2a3a, #241218)", "radial-gradient(120% 130% at 70% 30%, #2d4a3a, #14201a)"][i] }}>
              <div className="font-poppins text-[9.5px] font-semibold tracking-[0.12em] opacity-80">{m.k}</div>
              <div className="font-poppins text-[13.5px] font-semibold leading-snug mt-1">{m.t}</div>
              <div className="text-[11px] opacity-75 mt-0.5">{m.s}</div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-12 bg-brand-ink text-white p-8 flex items-center justify-between">
          <div><div className="font-poppins text-[22px] font-semibold">Let&apos;s build something extraordinary.</div><div className="text-[13px] opacity-80 mt-1">Open to advisory, fractional, and the right full-time role.</div></div>
          <button className="bg-white text-brand-ink font-poppins text-[13px] font-medium py-[11px] px-6">Work with Ava</button>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ t, link }: { t: string; link?: string }) {
  return (
    <div className="flex items-baseline justify-between mt-12 mb-4">
      <h2 className="font-poppins text-[13px] font-semibold uppercase tracking-[0.08em] text-[#3a352f]">{t}</h2>
      {link && <span className="font-poppins text-[12.5px] text-[#6B4BD6] font-medium">{link} →</span>}
    </div>
  );
}
