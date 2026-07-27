"use client";

// Recruiter / business search view — mockup for the deck.
// Brand-correct (codified tokens). Search across every field a professional fills in.

import { useState } from "react";
import { Logo } from "@/components/Logo";

const WAYS = ["Full-time", "Fractional", "Advisory", "Office Hours", "Project", "Speaking", "Coaching", "Content"];
const INDUSTRIES = ["SaaS", "Fintech", "Healthcare", "Consumer", "Marketplaces", "AI", "Media", "Climate"];
const STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Growth", "Public"];
const ARCHETYPES = ["The Strategist", "The Builder", "The Innovator", "The Processor", "The Coach", "The Communicator", "The Change Catalyst", "The Transactor"];
const SUPERPOWERS = ["0 → 1 Building", "Storytelling", "Community", "Systems Thinking", "Taste", "Fundraising"];
const TITLES = ["VP Marketing", "CMO", "Head of Growth", "CFO", "Head of Product", "COO", "Chief of Staff", "Head of Design"];
const VALUES = ["Directness", "Ownership", "Integrity", "Curiosity", "Excellence", "Empathy", "Transparency", "Resilience"];
const RATES = ["≤ $200/hr", "$200–500/hr", "$500+/hr", "Fractional ≤ $10k/mo", "$10k+/mo"];

type Pro = {
  name: string; headline: string; type: string; loc: string; avail: string; work: string;
  years: number; team: number; archetype: string; industries: string[]; stage: string;
  skills: string[]; supers: string[]; ways: { t: string; r: string }[]; pic: string;
};

const PROS: Pro[] = [
  { name: "Ava Bennett", headline: "GTM Leader · Brand Builder · AI Operator", type: "Executive · Entrepreneur", loc: "Westport, CT", avail: "Open now", work: "Remote", years: 20, team: 50, archetype: "The Strategist", industries: ["SaaS", "Fintech", "Consumer"], stage: "Seed – Series C", skills: ["Go-to-Market", "Brand", "Growth", "Community"], supers: ["Community", "Storytelling", "0 → 1 Building"], ways: [{ t: "Advisory", r: "$300/hr" }, { t: "Fractional", r: "from $8k/mo" }, { t: "Office Hours", r: "$350" }, { t: "Speaking", r: "Contact" }], pic: "https://i.pravatar.cc/120?img=5" },
  { name: "Marcus Lee", headline: "Product & Design Leader", type: "Executive", loc: "San Francisco, CA", avail: "Open to the right thing", work: "Hybrid", years: 12, team: 30, archetype: "The Builder", industries: ["SaaS", "Marketplaces", "AI"], stage: "Series A – B", skills: ["Product Design", "Design Systems", "0 → 1"], supers: ["Taste", "Team Building"], ways: [{ t: "Fractional", r: "from $10k/mo" }, { t: "Advisory", r: "$400/hr" }], pic: "https://i.pravatar.cc/120?img=12" },
  { name: "Priya Nair", headline: "Fractional CFO for scaling startups", type: "Professional", loc: "New York, NY", avail: "Open now", work: "Remote", years: 15, team: 20, archetype: "The Processor", industries: ["Fintech", "Healthcare"], stage: "Seed – Growth", skills: ["Finance", "FP&A", "Fundraising"], supers: ["Rigor", "Calm Under Pressure"], ways: [{ t: "Fractional", r: "from $12k/mo" }, { t: "Advisory", r: "Contact" }, { t: "Project", r: "Contact" }], pic: "https://i.pravatar.cc/120?img=32" },
];

function FacetChips({ label, opts, sel, sub }: { label: string; opts: string[]; sel: string[]; sub?: string }) {
  const [chosen, setChosen] = useState<string[]>(sel);
  return (
    <div className="mb-6">
      <div className="font-poppins text-[12px] font-semibold text-brand-ink mb-1">{label}</div>
      {sub && <div className="text-[11px] text-[#a8a29a] mb-2">{sub}</div>}
      <div className="flex flex-wrap gap-[6px]">
        {opts.map((o) => {
          const on = chosen.includes(o);
          return <button key={o} onClick={() => setChosen((c) => (c.includes(o) ? c.filter((x) => x !== o) : [...c, o]))} className={`font-poppins text-[12px] py-[5px] px-[10px] border ${on ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] text-[#3a352f] hover:border-[#3a352f]"}`}>{o}</button>;
        })}
      </div>
    </div>
  );
}

export default function RecruiterPreview() {
  const [years, setYears] = useState(10);
  const [yearsExp, setYearsExp] = useState(10);
  return (
    <div className="font-inter text-brand-ink bg-brand-paper min-h-screen">
      {/* top bar */}
      <header className="border-b border-[#ECEAE4] px-8 h-[64px] flex items-center gap-6 bg-white sticky top-0 z-10">
        <div className="text-[18px]"><Logo /></div>
        <div className="flex-1 max-w-[560px]">
          <div className="flex items-center gap-2 border border-[#E1DED7] px-3 py-[9px]">
            <span className="text-[#a8a29a]">⌕</span>
            <input placeholder="Search people, skills, companies, ways to work…" className="flex-1 font-inter text-[13.5px] focus:outline-none bg-transparent" />
            <span className="font-poppins text-[10.5px] text-[#a8a29a]">⌘K</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="font-poppins text-[13px] text-[#3a352f] cursor-pointer">Lists</span>
          <span className="font-poppins text-[13px] text-[#3a352f] cursor-pointer">Saved</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://i.pravatar.cc/64?img=15" alt="" className="w-[32px] h-[32px] rounded-full object-cover" />
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "288px 1fr" }}>
        {/* FILTERS */}
        <aside className="border-r border-[#ECEAE4] p-6 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto bg-white">
          <div className="font-poppins text-[13px] font-semibold mb-4">Filters</div>
          <FacetChips label="Work types" opts={WAYS} sel={["Fractional", "Advisory"]} />
          <FacetChips label="Titles open to" opts={TITLES} sel={["Head of Growth"]} />
          <FacetChips label="Industry" opts={INDUSTRIES} sel={["SaaS", "Fintech"]} />
          <FacetChips label="Company stage" opts={STAGES} sel={["Series A", "Series B"]} />
          <SliderFacet label="Years of experience" value={yearsExp} onChange={setYearsExp} />
          <SliderFacet label="Years leading teams" value={years} onChange={setYears} />
          <FacetChips label="Top skills" opts={["Go-to-Market", "Product", "Finance", "Design", "Growth", "Brand", "Data"]} sel={["Go-to-Market"]} />
          <FacetChips label="Superpowers" opts={SUPERPOWERS} sel={["0 → 1 Building"]} />
          <FacetChips label="Leadership type" opts={ARCHETYPES} sel={["The Strategist"]} />
          <FacetChips label="Values" opts={VALUES} sel={["Directness"]} />
          <FacetChips label="Rate" opts={RATES} sel={[]} />
          <FacetChips label="Availability" opts={["Open now", "Open to the right thing"]} sel={["Open now"]} />
          <FacetChips label="Work location" opts={["Remote", "Hybrid", "In-person"]} sel={["Remote"]} />
        </aside>

        {/* RESULTS */}
        <main className="p-8">
          <div className="flex items-baseline justify-between mb-5">
            <div><span className="font-poppins text-[20px] font-semibold">248 professionals</span> <span className="text-[13px] text-[#7d7a74]">match your filters</span></div>
            <div className="font-poppins text-[13px] text-[#3a352f]">Sort: Best match ▾</div>
          </div>

          <div className="space-y-4">
            {PROS.map((p) => (
              <div key={p.name} className="border border-[#E1DED7] bg-white p-5 hover:shadow-[0_4px_22px_rgba(30,26,20,0.07)] transition-shadow">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.pic} alt="" className="w-[56px] h-[56px] rounded-full object-cover flex-none" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-poppins text-[17px] font-semibold">{p.name}</span>
                      <span className="text-[#6B4BD6] text-[13px]">✓</span>
                      <span className="font-poppins text-[10.5px] text-[#6B4BD6] bg-[#F2EEFF] py-[2px] px-[7px]">{p.type}</span>
                    </div>
                    <div className="text-[13.5px] text-[#3a352f] mt-0.5">{p.headline}</div>
                    <div className="text-[12px] text-[#7d7a74] mt-1.5">{p.loc} · {p.work} · {p.avail} · Leads teams {p.years} yrs (largest {p.team}) · {p.archetype}</div>
                  </div>
                  <div className="flex flex-col gap-2 flex-none">
                    <button className="font-poppins bg-brand-ink text-white text-[12px] font-medium py-[8px] px-[16px]">Contact</button>
                    <button className="font-poppins border border-[#E1DED7] text-brand-ink text-[12px] py-[8px] px-[16px] hover:border-brand-ink">Save to list</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 mt-4 pt-4 border-t border-[#ECEAE4]">
                  <Col label="Top skills">{p.skills.map((s) => <Tag key={s}>{s}</Tag>)}</Col>
                  <Col label="Superpowers">{p.supers.map((s) => <Tag key={s}>{s}</Tag>)}</Col>
                  <Col label="Ways to work">{p.ways.map((w) => <span key={w.t} className="font-poppins text-[11.5px] py-[3px] px-[8px] bg-white border border-[#E1DED7]">{w.t} <span className="text-[#7d7a74]">{w.r}</span></span>)}</Col>
                </div>
                <div className="mt-3 flex flex-wrap gap-[6px] items-center">
                  <span className="font-poppins text-[11px] text-[#7d7a74]">Industries:</span>
                  {p.industries.map((i) => <Tag key={i}>{i}</Tag>)}
                  <span className="font-poppins text-[11px] text-[#7d7a74] ml-2">Stage:</span>
                  <Tag>{p.stage}</Tag>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function SliderFacet({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-6">
      <div className="font-poppins text-[12px] font-semibold text-brand-ink mb-1">{label}</div>
      <div className="text-[11px] text-[#a8a29a] mb-2">{value}+ years</div>
      <input type="range" min={0} max={30} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-[#6B4BD6]" />
    </div>
  );
}

function Col({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#a8a29a] mb-2">{label}</div>
      <div className="flex flex-wrap gap-[6px]">{children}</div>
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="font-poppins text-[11.5px] py-[3px] px-[8px] bg-[#F4F2EF]">{children}</span>;
}
