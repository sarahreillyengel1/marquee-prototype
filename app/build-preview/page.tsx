"use client";

// PREVIEW of the rebuilt questionnaire — public route (no auth) so Sarah can eyeball it live.
// Step-by-step build. Once approved, moves into /onboard with real state + persistence, reusing existing editors.

import { useState } from "react";
import { Logo } from "@/components/Logo";

const RAIL = [
  { label: null, steps: ["Resume"] },
  { label: "Build your profile", steps: ["About You", "Experience", "Leadership", "Impact", "Skills", "Superpowers", "Values", "Testimonials", "Education"] },
  { label: "Build your brand", steps: ["Work With Me", "Media", "Store", "Long Bio"] },
];
const ALL_STEPS = RAIL.flatMap((p) => p.steps);
const BUILT = new Set(["About You", "Experience", "Leadership", "Impact", "Skills", "Superpowers", "Work With Me"]);
const SKILL_INDUSTRIES = ["SaaS", "Fintech", "Healthcare", "Consumer", "Marketplaces", "AI", "Media", "E-commerce"];
const SKILL_LEVELS = ["Foundational", "Proficient", "Advanced", "Expert"];
// Ordered categories + auto-classification. In the real product this classification is done for the
// user (lookup + AI) so they never tag hard/soft or pick a category — they only set proficiency.
const SKILL_CATEGORIES = ["Marketing & Growth", "Leadership", "Communication", "Product", "Technical", "Finance", "Other"];
const SKILL_META: Record<string, { cat: string; type: "hard" | "soft" }> = {
  "Go-to-Market": { cat: "Marketing & Growth", type: "hard" },
  "Brand & Positioning": { cat: "Marketing & Growth", type: "hard" },
  "Growth": { cat: "Marketing & Growth", type: "hard" },
  "Demand Gen": { cat: "Marketing & Growth", type: "hard" },
  "Lifecycle Marketing": { cat: "Marketing & Growth", type: "hard" },
  "Team Leadership": { cat: "Leadership", type: "soft" },
  "Hiring": { cat: "Leadership", type: "soft" },
  "Coaching": { cat: "Leadership", type: "soft" },
  "Storytelling": { cat: "Communication", type: "soft" },
  "Public Speaking": { cat: "Communication", type: "soft" },
  "Writing": { cat: "Communication", type: "soft" },
  "Product Strategy": { cat: "Product", type: "hard" },
  "Roadmapping": { cat: "Product", type: "hard" },
  "AI & Automation": { cat: "Technical", type: "hard" },
  "SQL": { cat: "Technical", type: "hard" },
  "Financial Modeling": { cat: "Finance", type: "hard" },
};
const catOf = (n: string) => SKILL_META[n]?.cat ?? "Other";
const typeOf = (n: string): "hard" | "soft" => SKILL_META[n]?.type ?? "hard";

// Lightweight keyword suggester for the Superpowers step (preview only — the real product
// runs this through the Claude generation pass). Pulls notable phrases from the statement.
const KW_STOP = new Set("i a an and the to of for with into on in at as is are be it its it's their they them we our you your my me can could build builds building drive drives driven that this these those who what which very more most also but so or from by unique".split(" "));
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1];
    if (!KW_STOP.has(a) && !KW_STOP.has(b) && a.length > 2 && b.length > 2) bigrams.push(`${a} ${b}`);
  }
  const unigrams = words.filter((w) => w.length > 3 && !KW_STOP.has(w));
  const out: string[] = [];
  for (const k of [...bigrams, ...unigrams]) {
    if (!out.includes(k) && !out.some((o) => o.includes(k))) out.push(k);
    if (out.length >= 6) break;
  }
  return out;
}

type Offer = { key: string; title: string; blurb: string; added: boolean; kind: string; length: string; duration: string; rate: string; unit: string; hoursPerMonth: string; showRate: boolean; keywords: string; date: string; cadence: string; stage?: string; industries?: string; booking: string; desc: string };
const UNITS = ["per hour", "per day", "per week", "per month", "per session", "per event", "per project"];
const STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Growth", "Public"];
const BOOKING_OPTS: Record<string, { v: string; label: string }[]> = {
  office: [{ v: "book", label: "Book instantly" }, { v: "approval", label: "Request Approval" }],
  coaching: [{ v: "book", label: "Book instantly" }, { v: "message", label: "Send message" }, { v: "request", label: "Request" }],
  fractional: [{ v: "message", label: "Send message" }, { v: "proposal", label: "Request a proposal" }],
  project: [{ v: "message", label: "Send message" }, { v: "proposal", label: "Request a proposal" }],
  speaking: [{ v: "message", label: "Send message" }, { v: "proposal", label: "Request a proposal" }],
  advisory: [{ v: "message", label: "Send message" }, { v: "request", label: "Request" }],
  content: [{ v: "message", label: "Send message" }, { v: "request", label: "Request" }],
};
const KEYWORD_LABEL: Record<string, string> = { office: "Things I can advise on", coaching: "What I coach on", fractional: "Roles you're open to", project: "Types of projects", speaking: "Topics", advisory: "Types of companies you advise", content: "Content types" };
const bookLabel = (b: string) => (b === "book" ? "Book time" : b === "approval" ? "Request approval" : b === "proposal" ? "Request a proposal" : b === "request" ? "Request" : "Send message");

const TYPES = ["Professional", "Executive", "Entrepreneur", "Creative", "Coach", "Creator", "Student"];
const WORK_LOC = ["Remote", "Hybrid", "In-Person"];
const PROJECT_TYPES = ["Product Launch", "Campaign", "Fundraising", "Acquisition", "Redesign", "Product Development"];
const ARCHETYPES = [
  { name: "The Strategist", desc: "You provide vision, strategic direction, and outside-the-box thinking, like a chess player." },
  { name: "The Change Catalyst", desc: "You thrive in messy situations you can fix, but get bored when things are calm." },
  { name: "The Transactor", desc: "You thrive on negotiations and deal-making, skilled at spotting and tackling new opportunities." },
  { name: "The Builder", desc: "You dream of creating something and have the talent and determination to make your dreams come true." },
  { name: "The Innovator", desc: "You are a creative idea generator with a great capacity to solve extremely difficult problems." },
  { name: "The Processor", desc: "You like organizations to run smoothly, like a well-oiled machine, and set up structures and systems." },
  { name: "The Coach", desc: "You know how to get the best out of people and create a high-performance culture." },
  { name: "The Communicator", desc: "You are a great influence and significantly impact people and your surroundings." },
];
const MBTI = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP", "I don't know"];
const ENNEAGRAM = ["1 · Reformer", "2 · Helper", "3 · Achiever", "4 · Individualist", "5 · Investigator", "6 · Loyalist", "7 · Enthusiast", "8 · Challenger", "9 · Peacemaker", "I don't know"];
const DISC = ["D · Dominance", "I · Influence", "S · Steadiness", "C · Conscientiousness", "I don't know"];

// A timeline entry is EITHER a role (a job) OR a project (standalone work). Same level.
type Entry = { kind: "role" | "project"; logo?: string; primary: string; secondary: string; dates: string; desc: string; result: string; featured: boolean };

export default function BuildPreview() {
  const [active, setActive] = useState("Skills");

  // About You
  const [types, setTypes] = useState<string[]>(["Executive", "Entrepreneur"]);
  const [name, setName] = useState("Sarah Engel");
  const [headline, setHeadline] = useState("GTM Leader · Brand Builder · AI Operator");
  const [bio, setBio] = useState("I build systems, brands, and communities that drive growth.");
  const [city, setCity] = useState("Westport, CT");
  const [loc, setLoc] = useState("Remote");
  const [openNow, setOpenNow] = useState(true);
  const [dob, setDob] = useState("");
  const [socials, setSocials] = useState({ website: "", linkedin: "", instagram: "", x: "", tiktok: "", youtube: "", substack: "" });
  const toggleType = (t: string) => setTypes((c) => (c.includes(t) ? c.filter((x) => x !== t) : c.length < 3 ? [...c, t] : c));

  // Experience
  const [focus, setFocus] = useState("Building Marquee, a personal brand platform for how people work today.");
  const [entries, setEntries] = useState<Entry[]>([
    { kind: "role", primary: "Hello Alice", secondary: "VP Marketing", dates: "2016 – 2018", desc: "Led brand, product marketing and community strategy through Series A and scaled the platform to over 1.5M members.", result: "", featured: true },
    { kind: "role", primary: "Brex", secondary: "Head of Growth", dates: "2018 – 2020", desc: "Ran platform go-to-market and growth for the core product.", result: "", featured: false },
    { kind: "project", primary: "Community Platform Launch", secondary: "at Hello Alice", dates: "2017", desc: "Built and launched the community platform from the ground up.", result: "1.5M members", featured: false },
  ]);
  const upEntry = (i: number, patch: Partial<Entry>) => setEntries((e) => e.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addEntry = (kind: "role" | "project") => setEntries((e) => [...e, { kind, primary: "", secondary: "", dates: "", desc: "", result: "", featured: false }]);
  const rmEntry = (i: number) => setEntries((e) => e.filter((_, j) => j !== i));
  const featured = entries.find((x) => x.featured);

  // Leadership
  const [arch, setArch] = useState<string[]>(["The Strategist", "The Builder", "The Coach"]);
  const [mbti, setMbti] = useState("");
  const [enn, setEnn] = useState("");
  const [disc, setDisc] = useState("");
  const [ledTeam, setLedTeam] = useState(true);
  const [yearsLed, setYearsLed] = useState("20");
  const [largestTeam, setLargestTeam] = useState("50");
  const [orgs, setOrgs] = useState("5");
  const [philosophy, setPhilosophy] = useState("I build high-performing teams through clarity, trust, and a bias for action.");
  const toggleArch = (a: string) => setArch((c) => (c.includes(a) ? c.filter((x) => x !== a) : c.length < 4 ? [...c, a] : c));

  // Work With Me
  const [ftEnabled, setFtEnabled] = useState(true);
  const [ftRoles, setFtRoles] = useState("VP / Head of Marketing, CMO");
  const [expanded, setExpanded] = useState("office");
  const [offers, setOffers] = useState<Offer[]>([
    { key: "office", title: "Office Hours", blurb: "Focused 1:1 sessions.", added: true, kind: "", length: "60 minutes", duration: "", rate: "350", unit: "per session", hoursPerMonth: "", showRate: true, keywords: "Positioning, GTM strategy, Brand", date: "", cadence: "", booking: "book", desc: "Focused conversations for leaders and teams navigating big decisions." },
    { key: "fractional", title: "Fractional Role", blurb: "Join a company part-time.", added: true, kind: "", length: "", duration: "3 – 6 months", rate: "8000", unit: "per month", hoursPerMonth: "40", showRate: true, keywords: "Head of Marketing, VP Growth", date: "", cadence: "", booking: "proposal", desc: "Strategic marketing leadership to drive growth." },
    { key: "project", title: "Project Work", blurb: "Fixed-scope engagements.", added: false, kind: "", length: "", duration: "", rate: "", unit: "per project", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "proposal", desc: "" },
    { key: "speaking", title: "Speaking", blurb: "Events, podcasts & workshops.", added: false, kind: "Event", length: "", duration: "", rate: "", unit: "per event", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "proposal", desc: "" },
    { key: "advisory", title: "Advisory Board", blurb: "Board & advisory roles.", added: false, kind: "", length: "", duration: "", rate: "", unit: "", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "1 per quarter", booking: "request", desc: "" },
    { key: "coaching", title: "Coaching", blurb: "1:1 coaching.", added: false, kind: "", length: "45 minutes", duration: "", rate: "", unit: "per session", hoursPerMonth: "", showRate: true, keywords: "", date: "", cadence: "", booking: "book", desc: "" },
    { key: "content", title: "Content Partnership", blurb: "Creator & sponsored work.", added: false, kind: "", length: "", duration: "", rate: "", unit: "per post", hoursPerMonth: "", showRate: false, keywords: "UGC, Sponsored", date: "", cadence: "", booking: "request", desc: "" },
  ]);
  const upOffer = (k: string, patch: Partial<Offer>) => setOffers((o) => o.map((x) => (x.key === k ? { ...x, ...patch } : x)));

  // Impact
  const [impacts, setImpacts] = useState<{ headline: string; context: string; story: string }[]>([
    { headline: "Scaled community to 1.5M members", context: "Hello Alice · 2016 – 2018", story: "Built and grew the community platform from launch to 1.5M members through Series A." },
    { headline: "3.2× pipeline in 18 months", context: "Meridian · 2022 – Present", story: "Repositioned the platform around AI-native workflows and grew qualified pipeline 3.2x." },
  ]);
  const upImpact = (i: number, patch: Partial<{ headline: string; context: string; story: string }>) => setImpacts((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addImpact = () => setImpacts((m) => (m.length < 4 ? [...m, { headline: "", context: "", story: "" }] : m));
  const rmImpact = (i: number) => setImpacts((m) => m.filter((_, j) => j !== i));

  // Skills — top 5 starred, each with a named proficiency level (slider). Hard/soft + category are
  // auto-classified (see SKILL_META), not entered by the user. Plus "currently learning" + industries.
  type Skill = { name: string; level: string; top: boolean };
  const [skills, setSkills] = useState<Skill[]>([
    { name: "Go-to-Market", level: "Expert", top: true },
    { name: "Brand & Positioning", level: "Expert", top: true },
    { name: "Storytelling", level: "Expert", top: true },
    { name: "Growth", level: "Advanced", top: true },
    { name: "Team Leadership", level: "Advanced", top: true },
    { name: "Demand Gen", level: "Advanced", top: false },
    { name: "Lifecycle Marketing", level: "Proficient", top: false },
    { name: "Hiring", level: "Proficient", top: false },
    { name: "Coaching", level: "Advanced", top: false },
    { name: "Public Speaking", level: "Proficient", top: false },
    { name: "Writing", level: "Advanced", top: false },
    { name: "Product Strategy", level: "Advanced", top: false },
    { name: "Roadmapping", level: "Proficient", top: false },
    { name: "AI & Automation", level: "Proficient", top: false },
    { name: "SQL", level: "Foundational", top: false },
    { name: "Financial Modeling", level: "Foundational", top: false },
  ]);
  const [industries, setIndustries] = useState<string[]>(["SaaS", "Fintech", "Consumer"]);
  const [learning, setLearning] = useState<string[]>(["AI Agents", "Data Modeling"]);
  const [learnDraft, setLearnDraft] = useState("");
  const upSkillField = (i: number, patch: Partial<Skill>) => setSkills((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmSkill = (i: number) => setSkills((s) => s.filter((_, j) => j !== i));
  const topCount = skills.filter((s) => s.top).length;
  const toggleTop = (i: number) => setSkills((s) => s.map((x, j) => { if (j !== i) return x; if (!x.top && s.filter((y) => y.top).length >= 5) return x; return { ...x, top: !x.top }; }));
  const addLearn = () => { const v = learnDraft.trim(); if (v && !learning.includes(v)) setLearning((c) => [...c, v]); setLearnDraft(""); };
  const rmLearn = (k: string) => setLearning((c) => c.filter((x) => x !== k));

  // Superpowers — write up to 6 signature statements in your own voice + optional free-form proof.
  // The profile showcases the top SP_SHOWCASE; the rest live in the bio via "See all". Keywords auto-suggested for search.
  const SP_MAX = 6, SP_SHOWCASE = 3;
  const [powers, setPowers] = useState<{ statement: string; proof: string; keywords: string[] }[]>([
    { statement: "I spot unique white space for startups and build scalable business models that drive revenue.", proof: "At Hello Alice I saw an underserved market of founders, built the community platform around it, and grew it to 1.5M members.", keywords: ["white space", "scalable business models", "revenue", "startups"] },
    { statement: "I turn complex, ambiguous work into a story people repeat.", proof: "", keywords: ["storytelling", "positioning", "narrative"] },
    { statement: "I build communities that compound into distribution.", proof: "", keywords: ["community", "distribution", "growth"] },
    { statement: "I make pricing and packaging decisions that unlock new revenue.", proof: "", keywords: ["pricing", "packaging", "monetization"] },
  ]);
  const [kwDraft, setKwDraft] = useState<Record<number, string>>({});
  const upPower = (i: number, patch: Partial<{ statement: string; proof: string; keywords: string[] }>) => setPowers((c) => c.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addPower = () => setPowers((c) => (c.length < SP_MAX ? [...c, { statement: "", proof: "", keywords: [] }] : c));
  const rmPower = (i: number) => setPowers((c) => c.filter((_, j) => j !== i));
  const suggestKw = (i: number) => upPower(i, { keywords: extractKeywords(`${powers[i].statement} ${powers[i].proof}`) });
  const addKw = (i: number) => { const v = (kwDraft[i] || "").trim(); if (v && !powers[i].keywords.includes(v)) upPower(i, { keywords: [...powers[i].keywords, v] }); setKwDraft((d) => ({ ...d, [i]: "" })); };
  const rmKw = (i: number, k: string) => upPower(i, { keywords: powers[i].keywords.filter((x) => x !== k) });

  const stepNo = ALL_STEPS.indexOf(active);

  return (
    <div className="font-inter text-brand-ink bg-brand-paper min-h-screen grid" style={{ gridTemplateColumns: "248px 1fr 340px" }}>
      {/* ── RAIL ── */}
      <aside className="border-r border-[#ECEAE4] p-[26px_18px] sticky top-0 h-screen overflow-y-auto flex flex-col gap-[3px] bg-white">
        <div className="mb-7 pl-2 text-[18px]"><Logo /></div>
        {RAIL.map((phase, pi) => (
          <div key={pi}>
            {phase.label && <div className="font-poppins text-[10px] font-semibold uppercase tracking-[0.13em] text-[#7d7a74] mt-4 mb-2 ml-2">{phase.label}</div>}
            {phase.steps.map((s) => {
              const isActive = s === active, done = s === "Resume" || (BUILT.has(s) && s !== active);
              const n = s === "Resume" ? "✓" : ALL_STEPS.indexOf(s);
              return (
                <div key={s} onClick={() => setActive(s)} className={`flex items-center gap-[11px] py-2 px-[10px] cursor-pointer ${isActive ? "bg-[#F2EEFF]" : "hover:bg-[#faf9fc]"}`}>
                  <span className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center text-[11px] font-semibold border-[1.5px] ${s === "Resume" ? "bg-brand-ink border-brand-ink text-white" : isActive ? "bg-[#6B4BD6] border-[#6B4BD6] text-white" : "border-[#E1DED7] text-[#7d7a74] bg-white"}`}>{s === "Resume" ? "✓" : n}</span>
                  <span className={`font-poppins text-[13px] leading-tight ${isActive ? "text-[#6B4BD6] font-semibold" : "text-[#3a352f]"}`}>{s}{s === "Resume" ? <span className="block text-[11px] text-[#7d7a74] font-normal">Imported</span> : null}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div className="mt-auto pt-5"><div className="border border-[#ECEAE4] p-[14px]"><div className="font-poppins text-[14px] font-semibold">Almost there</div><div className="text-[11.5px] text-[#7d7a74] mt-0.5 mb-[10px]">You're in the final stretch.</div><div className="h-[6px] bg-[#ECEAE4]"><div className="h-full bg-[#6B4BD6]" style={{ width: "38%" }} /></div></div></div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-end items-center gap-4 py-5 px-10 border-b border-[#ECEAE4]">
          <span className="font-poppins text-[13px] text-[#7d7a74] cursor-pointer">Save and exit</span>
          <button className="font-poppins bg-brand-ink text-white text-[13px] font-medium py-[11px] px-5 inline-flex items-center gap-2">Continue →</button>
        </div>

        <main className="p-[40px_48px] flex-1 max-w-[820px]">
          <span className="font-poppins inline-block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B4BD6] bg-[#F2EEFF] py-[5px] px-[11px] mb-4">Step {stepNo} of 13 · {active}</span>

          {active === "About You" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Let's start with you.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">The basics that anchor your profile. You can change any of this later.</p>
              <div className="mb-7">
                <label className="font-poppins text-[13px] font-semibold block mb-1">What kind of professional are you?</label>
                <p className="text-[13px] text-[#7d7a74] mb-3">Pick up to 3. This shapes how your profile is laid out.</p>
                <div className="flex flex-wrap gap-[10px]">
                  {TYPES.map((t) => { const on = types.includes(t); return <button key={t} onClick={() => toggleType(t)} className={`font-poppins text-[14px] font-medium py-[11px] px-[18px] border-[1.5px] ${on ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-[#3a352f]"}`}>{t}</button>; })}
                </div>
              </div>
              <div className="mb-6"><label className="font-poppins text-[13px] font-semibold block mb-2">Photo</label><div className="w-[88px] h-[88px] border-[1.5px] border-dashed border-[#E1DED7] flex items-center justify-center text-[12px] text-[#7d7a74] cursor-pointer text-center leading-tight">Add<br />photo</div></div>
              <div className="grid grid-cols-2 gap-[18px] max-w-[600px]"><Field label="Name" value={name} onChange={setName} /><Field label="City / State" value={city} onChange={setCity} /></div>
              <div className="max-w-[600px] mt-[18px]"><Field label="Headline" value={headline} onChange={setHeadline} max={60} /></div>
              <div className="max-w-[600px] mt-[18px]"><Field label="About" value={bio} onChange={setBio} max={200} textarea /></div>
              <div className="mt-6"><label className="font-poppins text-[13px] font-semibold block mb-2">Preferred Work Location</label><div className="flex gap-[10px]">{WORK_LOC.map((w) => <button key={w} onClick={() => setLoc(w)} className={`font-poppins text-[13px] py-[9px] px-[16px] border-[1.5px] ${loc === w ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{w}</button>)}</div></div>
              <label className="flex items-center gap-[10px] mt-[18px] cursor-pointer"><input type="checkbox" checked={openNow} onChange={() => setOpenNow(!openNow)} /><span className="font-poppins text-[14px]">Open to opportunities now</span></label>
              <div className="mt-6 max-w-[600px]"><label className="font-poppins text-[13px] font-semibold block mb-2">Links</label><div className="grid grid-cols-2 gap-[12px]">
                <SocialField label="Website" v={socials.website} on={(x) => setSocials((s) => ({ ...s, website: x }))} ph="yoursite.com" />
                <SocialField label="LinkedIn" v={socials.linkedin} on={(x) => setSocials((s) => ({ ...s, linkedin: x }))} ph="linkedin.com/in/you" />
                <SocialField label="Instagram" v={socials.instagram} on={(x) => setSocials((s) => ({ ...s, instagram: x }))} ph="instagram.com/you" />
                <SocialField label="X" v={socials.x} on={(x) => setSocials((s) => ({ ...s, x }))} ph="x.com/you" />
                <SocialField label="TikTok" v={socials.tiktok} on={(x) => setSocials((s) => ({ ...s, tiktok: x }))} ph="tiktok.com/@you" />
                <SocialField label="YouTube" v={socials.youtube} on={(x) => setSocials((s) => ({ ...s, youtube: x }))} ph="youtube.com/@you" />
                <SocialField label="Substack" v={socials.substack} on={(x) => setSocials((s) => ({ ...s, substack: x }))} ph="you.substack.com" />
              </div></div>
              <div className="mt-6 max-w-[280px]"><label className="font-poppins text-[13px] font-semibold block mb-2">Date of birth <span className="font-normal text-[#7d7a74]">· private, never shown</span></label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" /></div>
            </>
          )}

          {active === "Experience" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Your experience.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">We pulled your roles from your resume. Confirm them, add projects, and feature your best work.</p>

              <div className="max-w-[620px] mb-8"><Field label="Current focus" value={focus} onChange={setFocus} max={160} textarea /></div>

              <div className="font-poppins text-[13px] font-semibold mb-1">Timeline</div>
              <p className="text-[12.5px] text-[#7d7a74] mb-3">Add your roles (full-time jobs) and your projects (consulting or client engagements). Both sit on your timeline. Star the ones to feature.</p>
              <div className="space-y-4 max-w-[720px]">
                {entries.map((e, i) => (
                  <div key={i} className="border border-[#E1DED7] p-[18px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-poppins text-[10px] font-semibold uppercase tracking-[0.1em] py-[3px] px-[8px] ${e.kind === "role" ? "bg-[#F2EEFF] text-[#6B4BD6]" : "bg-[#F4F2EF] text-[#3a352f]"}`}>{e.kind === "role" ? "Role" : "Project"}</span>
                      <button onClick={() => upEntry(i, { featured: !e.featured })} className={`font-poppins text-[11px] font-semibold py-[7px] px-[11px] border-[1.5px] whitespace-nowrap ${e.featured ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] text-[#7d7a74]"}`}>{e.featured ? "★ Featured" : "☆ Feature"}</button>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-[46px] h-[46px] flex-none border-[1.5px] border-dashed border-[#E1DED7] flex items-center justify-center cursor-pointer text-center" title={e.kind === "role" ? "Upload company logo" : "Upload a logo or image"}>
                        {e.primary ? <span className="font-poppins font-semibold text-[16px] text-[#254B18]">{e.primary[0].toUpperCase()}</span> : <span className="text-[9px] text-[#7d7a74] leading-tight">Add<br />logo</span>}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-[12px]">
                        <input value={e.primary} placeholder={e.kind === "role" ? "Company" : "What was the project?"} onChange={(ev) => upEntry(i, { primary: ev.target.value })} className="font-poppins font-semibold text-[15px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                        <input value={e.dates} placeholder="2020 – 2023" onChange={(ev) => upEntry(i, { dates: ev.target.value })} className="font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      </div>
                    </div>
                    <input value={e.secondary} placeholder={e.kind === "role" ? "Your title" : "Client (who it was for)"} onChange={(ev) => upEntry(i, { secondary: ev.target.value })} className="w-full font-inter text-[14px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 focus:outline-none focus:border-brand-ink" />
                    <textarea value={e.desc} placeholder="What you did and what changed." onChange={(ev) => upEntry(i, { desc: ev.target.value })} rows={2} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none mt-2 focus:outline-none focus:border-brand-ink" />
                    {e.kind === "project" && (
                      <input value={e.result} placeholder="Result (optional), e.g. 1.5M members" onChange={(ev) => upEntry(i, { result: ev.target.value })} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 focus:outline-none focus:border-brand-ink" />
                    )}
                    <div className="text-right mt-2"><button onClick={() => rmEntry(i)} className="font-poppins text-[11px] text-[#7d7a74] hover:text-brand-orange">Remove</button></div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => addEntry("role")} className="flex-1 font-poppins text-[13px] text-[#7d7a74] py-3 border-[2px] border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a role</button>
                  <button onClick={() => addEntry("project")} className="flex-1 font-poppins text-[13px] text-[#7d7a74] py-3 border-[2px] border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a project</button>
                </div>
              </div>
            </>
          )}

          {active === "Leadership" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">How you lead.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Share how you lead teams, make decisions, and collaborate.</p>

              <div className="mb-8">
                <label className="font-poppins text-[13px] font-semibold block mb-1">Your archetype</label>
                <p className="text-[12.5px] text-[#7d7a74] mb-3">Pick up to 4.</p>
                <div className="grid grid-cols-2 gap-[10px] max-w-[620px]">
                  {ARCHETYPES.map((a) => { const on = arch.includes(a.name); return (
                    <button key={a.name} onClick={() => toggleArch(a.name)} className={`text-left p-[14px] border-[1.5px] ${on ? "border-[#6B4BD6] bg-[#F2EEFF]" : "border-[#E1DED7] bg-white hover:border-[#3a352f]"}`}>
                      <div className="font-poppins text-[15px] font-semibold">{a.name}</div>
                      <div className="text-[12px] text-[#7d7a74] mt-0.5">{a.desc}</div>
                    </button>
                  ); })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-[14px] max-w-[620px] mb-8">
                <div><label className="font-poppins text-[13px] font-semibold block mb-2">MBTI <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <select value={mbti} onChange={(e) => setMbti(e.target.value)} className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink"><option value="">Select</option>{MBTI.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div><label className="font-poppins text-[13px] font-semibold block mb-2">Enneagram <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <select value={enn} onChange={(e) => setEnn(e.target.value)} className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink"><option value="">Select</option>{ENNEAGRAM.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div><label className="font-poppins text-[13px] font-semibold block mb-2">DISC <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <input value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="e.g. DI, SC" className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" /></div>
              </div>

              <div>
                <label className="font-poppins text-[13px] font-semibold block mb-2">Have you led a team?</label>
                <div className="flex gap-[10px] mb-4">
                  {[true, false].map((v) => <button key={String(v)} onClick={() => setLedTeam(v)} className={`font-poppins text-[13px] py-[9px] px-[20px] border-[1.5px] ${ledTeam === v ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{v ? "Yes" : "No"}</button>)}
                </div>
                {ledTeam && (
                  <div className="border border-[#E1DED7] p-[18px] max-w-[500px]">
                    <div className="grid grid-cols-3 gap-[12px] mb-2">
                      <MiniStat label="Years leading" value={yearsLed} onChange={setYearsLed} />
                      <MiniStat label="Largest team" value={largestTeam} onChange={setLargestTeam} />
                      <MiniStat label="Organizations" value={orgs} onChange={setOrgs} />
                    </div>
                    <div className="text-[11px] text-[#a8a29a] mb-4">These are searchable, they power recruiter filters.</div>
                    <div className="flex items-baseline justify-between mb-2"><label className="font-poppins text-[13px] font-semibold">Leadership philosophy</label><span className="text-[11px] text-[#7d7a74]">{philosophy.length} / 280</span></div>
                    <textarea value={philosophy} maxLength={280} onChange={(e) => setPhilosophy(e.target.value)} rows={3} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                  </div>
                )}
              </div>
            </>
          )}

          {active === "Work With Me" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Work With Me</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Select one or more ways people can work with you. Add details for each option you select.</p>

              {/* Full-time */}
              <div className="border border-[#E1DED7] p-[18px] mb-4 max-w-[720px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] ${ftEnabled ? "bg-[#6B4BD6] text-white" : "bg-[#F4F2EF] text-[#7d7a74]"}`}>{ftEnabled ? "✓" : "+"}</span>
                    <div><div className="font-poppins text-[15px] font-semibold">Full-time</div><div className="text-[12.5px] text-[#7d7a74]">Open to the right full-time role.</div></div>
                  </div>
                  <label className="flex items-center gap-[7px] text-[12.5px] font-poppins cursor-pointer"><input type="checkbox" checked={ftEnabled} onChange={() => setFtEnabled(!ftEnabled)} /> Open</label>
                </div>
                {ftEnabled && <div className="mt-3"><label className="font-poppins text-[12px] text-[#7d7a74] block mb-1">Role titles you're open to <span className="text-[#a8a29a]">· add one or more, searchable</span></label><input value={ftRoles} onChange={(e) => setFtRoles(e.target.value)} placeholder="VP Marketing, CMO, Head of Growth" className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" /></div>}
              </div>

              {/* Offerings grid */}
              <div className="grid grid-cols-2 gap-3 max-w-[720px]">
                {offers.map((o) => {
                  const isOpen = expanded === o.key && o.added;
                  if (isOpen) {
                    const opts = BOOKING_OPTS[o.key] || [];
                    const instant = o.booking === "book";
                    const showRate = o.key === "office" ? true : o.showRate;
                    const inp = "w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
                    const lab = "font-poppins text-[12px] text-[#7d7a74] block mb-1";
                    const rateCell = o.key === "advisory" ? null : (
                      <div>
                        <div className="flex items-center justify-between mb-1"><label className="font-poppins text-[12px] text-[#7d7a74]">Rate (USD)</label>{o.key !== "office" && <button onClick={() => upOffer(o.key, { showRate: !o.showRate })} className="font-poppins text-[11px] text-[#6B4BD6]">{o.showRate ? "Hide, take requests" : "Set a rate"}</button>}</div>
                        {showRate ? <div className="flex items-center gap-2"><input value={o.rate} onChange={(e) => upOffer(o.key, { rate: e.target.value })} placeholder="Amount" className="flex-1 font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" /><select value={o.unit} onChange={(e) => upOffer(o.key, { unit: e.target.value })} className="w-[128px] font-inter text-[12.5px] py-[9px] px-[8px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div> : <div className="text-[12.5px] text-[#7d7a74] py-[9px]">People request, you quote later.</div>}
                      </div>
                    );
                    return (
                    <div key={o.key} className="col-span-2 border border-[#E1DED7] p-[20px] shadow-[0_4px_22px_rgba(30,26,20,0.07)]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3"><span className="w-[24px] h-[24px] rounded-full bg-[#6B4BD6] text-white flex items-center justify-center text-[13px]">✓</span><div><div className="font-poppins text-[15px] font-semibold">{o.title}</div><div className="text-[12.5px] text-[#7d7a74]">{o.blurb}</div></div></div>
                        <button onClick={() => setExpanded("")} className="text-[#7d7a74] text-[16px]">⌃</button>
                      </div>

                      {(o.key === "office" || o.key === "coaching") && (
                        <div className="grid grid-cols-2 gap-[14px]">
                          <div><label className={lab}>Session length</label><select value={o.length} onChange={(e) => upOffer(o.key, { length: e.target.value })} className={inp}>{["15 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes"].map((t) => <option key={t}>{t}</option>)}</select></div>
                          {rateCell}
                        </div>
                      )}
                      {o.key === "fractional" && (
                        <>
                          <div className="grid grid-cols-2 gap-[14px]">
                            <div><label className={lab}>Typical duration</label><input value={o.duration} onChange={(e) => upOffer(o.key, { duration: e.target.value })} placeholder="e.g. 3 – 6 months" className={inp} /></div>
                            <div><label className={lab}>Hours available / month</label><input value={o.hoursPerMonth} onChange={(e) => upOffer(o.key, { hoursPerMonth: e.target.value })} placeholder="e.g. 40" className={inp} /></div>
                          </div>
                          <div className="mt-[14px] max-w-[320px]">{rateCell}</div>
                        </>
                      )}
                      {o.key === "project" && (
                        <div className="grid grid-cols-2 gap-[14px]">
                          <div><label className={lab}>Typical duration</label><input value={o.duration} onChange={(e) => upOffer(o.key, { duration: e.target.value })} placeholder="e.g. 6 – 12 weeks" className={inp} /></div>
                          {rateCell}
                        </div>
                      )}
                      {o.key === "speaking" && (
                        <>
                          <div className="grid grid-cols-2 gap-[14px]">
                            <div><label className={lab}>Type</label><select value={o.kind} onChange={(e) => upOffer(o.key, { kind: e.target.value })} className={inp}>{["Event", "Podcast", "Workshop"].map((t) => <option key={t}>{t}</option>)}</select></div>
                            <div><label className={lab}>Length</label><input value={o.length} onChange={(e) => upOffer(o.key, { length: e.target.value })} placeholder="e.g. 45 min keynote" className={inp} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-[14px] mt-[14px]">
                            {rateCell}
                            <div><label className={lab}>Available date</label><input value={o.date} onChange={(e) => upOffer(o.key, { date: e.target.value })} placeholder="Type an available date" className={inp} /></div>
                          </div>
                        </>
                      )}
                      {o.key === "advisory" && (
                        <>
                          <div className="grid grid-cols-2 gap-[14px]">
                            <div><label className={lab}>Availability</label><input value={o.cadence} onChange={(e) => upOffer(o.key, { cadence: e.target.value })} placeholder="e.g. 1 per quarter" className={inp} /></div>
                            <div><label className={lab}>Industries</label><input value={o.industries || ""} onChange={(e) => upOffer(o.key, { industries: e.target.value })} placeholder="Fintech, SaaS, Consumer…" className={inp} /></div>
                          </div>
                          <div className="mt-[14px]"><label className={lab}>Company stage <span className="text-[#a8a29a]">· select any</span></label>
                            <div className="flex flex-wrap gap-[8px]">
                              {STAGES.map((s) => { const sel = (o.stage || "").split(", ").filter(Boolean); const on = sel.includes(s); return <button key={s} onClick={() => upOffer(o.key, { stage: (on ? sel.filter((x) => x !== s) : [...sel, s]).join(", ") })} className={`font-poppins text-[12.5px] py-[7px] px-[13px] border-[1.5px] ${on ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{s}</button>; })}
                            </div>
                          </div>
                        </>
                      )}
                      {o.key === "content" && (
                        <div className="text-[12.5px] text-[#3a352f] bg-[#F4F2EF] p-[12px]">This opens your <b>media kit</b>, a rate card with your platforms, audience, deliverables and prices. <span className="text-[#6B4BD6] font-medium cursor-pointer">Build media kit →</span></div>
                      )}

                      <div className="mt-[14px]"><label className={lab}>{KEYWORD_LABEL[o.key]} <span className="text-[#a8a29a]">· searchable, helps people find you</span></label><input value={o.keywords} onChange={(e) => upOffer(o.key, { keywords: e.target.value })} placeholder="Add keywords, separated by commas" className={inp} /></div>

                      <div className="mt-[14px]"><label className={lab}>Description (optional)</label><textarea value={o.desc} onChange={(e) => upOffer(o.key, { desc: e.target.value })} rows={2} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" /></div>

                      <div className="mt-[16px] pt-[14px] border-t border-[#ECEAE4]"><label className={lab}>How they reach you</label><select value={o.booking} onChange={(e) => upOffer(o.key, { booking: e.target.value })} className="max-w-[240px] font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink">{opts.map((op) => <option key={op.v} value={op.v}>{op.label}</option>)}</select></div>
                      {instant && <div className="mt-[12px] text-[12px] text-[#3a352f] bg-[#F2EEFF] p-[11px]">Book instantly connects <b>Calendly / Cal.com</b> for scheduling and takes payment through <b>Stripe Checkout</b>. <span className="text-[#6B4BD6] font-medium cursor-pointer">Connect Calendly →</span></div>}
                      <div className="flex items-center justify-between mt-4"><button onClick={() => upOffer(o.key, { added: false })} className="font-poppins text-[12px] text-brand-orange">Delete</button><button onClick={() => setExpanded("")} className="font-poppins border border-[#E1DED7] text-brand-ink text-[12.5px] font-medium py-[8px] px-[16px] hover:border-brand-ink">Done</button></div>
                    </div>
                    );
                  }
                  return (
                    <div key={o.key} onClick={() => (o.added ? setExpanded(o.key) : (upOffer(o.key, { added: true }), setExpanded(o.key)))} className="border border-[#E1DED7] p-[16px] flex items-center gap-3 cursor-pointer hover:border-[#3a352f]">
                      <span className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] ${o.added ? "bg-[#6B4BD6] text-white" : "bg-[#F4F2EF] text-[#7d7a74]"}`}>{o.added ? "✓" : "+"}</span>
                      <div className="flex-1"><div className="font-poppins text-[14px] font-semibold">{o.title}</div><div className="text-[12px] text-[#7d7a74]">{o.blurb}</div></div>
                      <span className="text-[#7d7a74] text-[15px]">{o.added ? "⌄" : "›"}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-2 text-[12.5px] text-[#7d7a74] max-w-[720px]">🔒 You control what's visible. You can hide or edit any offering at any time.</div>
            </>
          )}

          {active === "Impact" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Your impact.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Add up to 4 career highlights. Not job duties, the moments something measurably changed because you were there.</p>
              <div className="space-y-4 max-w-[720px]">
                {impacts.map((im, i) => (
                  <div key={i} className="border border-[#E1DED7] p-[18px]">
                    <div className="flex justify-between items-center mb-3"><span className="font-poppins text-[12px] font-semibold text-[#7d7a74]">Highlight {i + 1}</span><button onClick={() => rmImpact(i)} className="font-poppins text-[11px] text-[#7d7a74] hover:text-brand-orange">Remove</button></div>
                    <input value={im.headline} onChange={(e) => upImpact(i, { headline: e.target.value })} placeholder="Headline, e.g. Scaled pipeline 3× in 9 months" className="w-full font-poppins font-semibold text-[15px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <input value={im.context} onChange={(e) => upImpact(i, { context: e.target.value })} placeholder="Company / context, e.g. Meridian · 2024" className="w-full font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <textarea value={im.story} onChange={(e) => upImpact(i, { story: e.target.value })} rows={2} placeholder="What you did, what changed, why it mattered." className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                  </div>
                ))}
                {impacts.length < 4 && <button onClick={addImpact} className="w-full font-poppins text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a highlight</button>}
              </div>
            </>
          )}

          {active === "Skills" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Your skills.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[56ch] leading-[1.5] mb-7">Your skills, how deep they run, and what you&apos;re growing into. Star up to 5 to lead your profile, then slide to set how deep each one runs. We sort them into categories for you.</p>

              <div className="mb-8 max-w-[680px]">
                <div className="flex items-center gap-3 mb-4">
                  <input placeholder="Search to add a skill…" className="flex-1 font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                  <span className="text-[11px] text-[#7d7a74] shrink-0 whitespace-nowrap">★ {topCount}/5 top · {skills.length} skills</span>
                </div>
                <div className="space-y-5">
                  {SKILL_CATEGORIES.map((cat) => {
                    const rows = skills.map((s, i) => ({ s, i })).filter((x) => catOf(x.s.name) === cat);
                    if (!rows.length) return null;
                    return (
                      <div key={cat}>
                        <div className="font-poppins text-[11px] font-semibold text-[#7d7a74] uppercase tracking-[0.08em] mb-2">{cat} <span className="font-normal text-[#a8a29a] normal-case tracking-normal">· {rows.length}</span></div>
                        <div className="space-y-2">
                          {rows.map(({ s, i }) => (
                            <div key={i} className="flex items-center gap-3 border border-[#E1DED7] py-[7px] px-[10px]">
                              <button onClick={() => toggleTop(i)} title="Feature in top 5" className={`text-[16px] leading-none shrink-0 ${s.top ? "text-[#6B4BD6]" : "text-[#d8d4cc] hover:text-[#6B4BD6]"}`}>★</button>
                              <input value={s.name} onChange={(e) => upSkillField(i, { name: e.target.value })} className="flex-1 min-w-0 font-inter text-[13.5px] py-[4px] focus:outline-none" />
                              <div className="w-[150px] shrink-0">
                                <input type="range" min={1} max={4} step={1} value={SKILL_LEVELS.indexOf(s.level) + 1} onChange={(e) => upSkillField(i, { level: SKILL_LEVELS[+e.target.value - 1] })} className="w-full accent-[#6B4BD6] cursor-pointer" />
                                <div className="font-poppins text-[10px] text-[#7d7a74] text-right -mt-[2px]">{s.level}</div>
                              </div>
                              <button onClick={() => rmSkill(i)} className="text-[#7d7a74] hover:text-brand-orange text-[15px] shrink-0">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 max-w-[560px]">
                <label className="font-poppins text-[13px] font-semibold block mb-1">Currently learning <span className="font-normal text-[#a8a29a]">· the top skills you&apos;re building right now</span></label>
                <div className="flex flex-wrap gap-[6px] items-center border border-[#E1DED7] py-[7px] px-[9px]">
                  {learning.map((k) => <span key={k} className="inline-flex items-center gap-1 font-poppins text-[12px] py-[4px] px-[9px] bg-[#EAF6E4] text-[#4f7a43]">{k}<button onClick={() => rmLearn(k)} className="text-[#4f7a43]/60 hover:text-[#4f7a43]">×</button></span>)}
                  <input value={learnDraft} onChange={(e) => setLearnDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearn())} placeholder="add a skill…" className="flex-1 min-w-[100px] font-inter text-[12.5px] py-[4px] px-[6px] focus:outline-none" />
                </div>
              </div>

              <div className="max-w-[680px]">
                <label className="font-poppins text-[13px] font-semibold block mb-2">Industries <span className="font-normal text-[#a8a29a]">· where you&apos;ve worked · powers search</span></label>
                <div className="flex flex-wrap gap-[8px]">
                  {SKILL_INDUSTRIES.map((t) => { const on = industries.includes(t); return <button key={t} onClick={() => setIndustries((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))} className={`font-poppins text-[13px] py-[7px] px-[13px] border ${on ? "border-[#6B4BD6] bg-[#F2EEFF] text-[#6B4BD6]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-brand-ink"}`}>{t}</button>; })}
                </div>
              </div>
            </>
          )}

          {active === "Superpowers" && (
            <>
              <h1 className="font-poppins text-[32px] font-semibold tracking-[-0.02em] leading-[1.05] mb-[10px]">Your superpowers.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[56ch] leading-[1.5] mb-6">The things you&apos;re uniquely great at — in your own words. Write it like you&apos;d say it out loud. Your profile showcases your top {SP_SHOWCASE}; the rest live in your bio. We pull the keywords that make you findable.</p>
              <div className="space-y-4 max-w-[720px]">
                {powers.map((p, i) => (
                  <div key={i} className={`p-[18px] border ${i < SP_SHOWCASE ? "border-[#E1DED7]" : "border-dashed border-[#DBD7CF] bg-[#FBFAF8]"}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-poppins text-[12px] font-semibold text-[#6B4BD6]">Superpower {String(i + 1).padStart(2, "0")}{i < SP_SHOWCASE ? "" : <span className="text-[#a8a29a] font-medium"> · shows in bio</span>}</span>
                      <button onClick={() => rmPower(i)} className="font-poppins text-[11px] text-[#7d7a74] hover:text-brand-orange">Remove</button>
                    </div>
                    <textarea value={p.statement} onChange={(e) => upPower(i, { statement: e.target.value })} rows={2} placeholder="e.g. I spot unique white space for startups and build scalable business models that drive revenue." className="w-full font-poppins font-semibold text-[15px] leading-snug py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                    <textarea value={p.proof} onChange={(e) => upPower(i, { proof: e.target.value })} rows={2} placeholder="Proof — one example (optional). What was the situation, what you did, what changed." className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 resize-none focus:outline-none focus:border-brand-ink" />
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-poppins text-[11.5px] font-semibold text-[#7d7a74]">Search keywords <span className="font-normal text-[#a8a29a]">· helps people find you · never shown on your profile</span></span>
                        <button onClick={() => suggestKw(i)} className="font-poppins text-[11px] text-[#6B4BD6] hover:underline">↻ Suggest from text</button>
                      </div>
                      <div className="flex flex-wrap gap-[6px] items-center">
                        {p.keywords.map((k) => <span key={k} className="inline-flex items-center gap-1 font-poppins text-[12px] py-[4px] px-[9px] bg-[#F2EEFF] text-[#6B4BD6]">{k}<button onClick={() => rmKw(i, k)} className="text-[#6B4BD6]/50 hover:text-[#6B4BD6]">×</button></span>)}
                        <input value={kwDraft[i] || ""} onChange={(e) => setKwDraft((d) => ({ ...d, [i]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKw(i))} placeholder="add…" className="font-inter text-[12px] py-[4px] px-[8px] border border-[#E1DED7] w-[80px] focus:outline-none focus:border-brand-ink" />
                      </div>
                    </div>
                  </div>
                ))}
                {powers.length < SP_MAX && <button onClick={addPower} className="w-full font-poppins text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a superpower <span className="text-[#a8a29a]">({powers.length}/{SP_MAX})</span></button>}
              </div>
            </>
          )}

          {!BUILT.has(active) && (
            <div className="mt-10 text-[14px] text-[#7d7a74]">"{active}" is next in the step-by-step build. Building it once you've signed off on this step.</div>
          )}
        </main>
      </div>

      {/* ── PREVIEW ── */}
      <aside className="border-l border-[#ECEAE4] p-[26px_22px] sticky top-0 h-screen overflow-y-auto bg-white">
        <div className="text-center mb-[18px]"><div className="font-poppins text-[15px] font-semibold">Profile preview</div><div className="text-[11.5px] text-[#7d7a74] mt-0.5">Updates as you edit</div></div>

        {active === "About You" && (
          <div className="bg-white border border-[#ECEAE4] p-5">
            <div className="w-[54px] h-[54px] rounded-full bg-[#E6E2D0] mb-[14px]" />
            <div className="font-poppins text-[20px] font-semibold leading-tight">{name || "Your name"}</div>
            <div className="font-poppins text-[12px] font-medium text-[#6B4BD6] mt-1">{headline || "Your headline"}</div>
            <div className="text-[12.5px] text-[#3a352f] mt-2 leading-snug">{bio}</div>
            <div className="flex flex-wrap gap-[6px] mt-3">{types.map((t) => <span key={t} className="font-poppins text-[10.5px] font-medium py-[3px] px-[8px] bg-[#F4F2EF]">{t}</span>)}</div>
            <div className="text-[11.5px] text-[#7d7a74] mt-3">{city} · {loc}{openNow ? " · Open now" : ""}</div>
          </div>
        )}

        {active === "Experience" && (
          <div className="bg-white border border-[#ECEAE4] p-5">
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-3">Featured Experience</div>
            {featured ? (
              <>
                <span className={`font-poppins text-[9.5px] font-semibold uppercase tracking-[0.1em] py-[2px] px-[7px] ${featured.kind === "role" ? "bg-[#F2EEFF] text-[#6B4BD6]" : "bg-[#F4F2EF] text-[#3a352f]"}`}>{featured.kind === "role" ? "Role" : "Project"}</span>
                <div className="font-poppins text-[16px] font-semibold mt-2">{featured.primary || "Untitled"}</div>
                <div className="font-poppins text-[12.5px] text-[#6B4BD6] mt-0.5">{[featured.secondary, featured.dates].filter(Boolean).join(" · ")}</div>
                <div className="text-[12.5px] text-[#3a352f] mt-2 leading-snug">{featured.desc}</div>
                {featured.result && <div className="inline-block font-poppins text-[11px] py-[3px] px-[8px] bg-[#F4F2EF] mt-3">{featured.result}</div>}
              </>
            ) : <div className="text-[12.5px] text-[#7d7a74]">Star a role or project to feature it here.</div>}
            <div className="text-[11.5px] text-[#7d7a74] mt-4 pt-3 border-t border-[#ECEAE4]">Timeline: {entries.filter((e) => e.kind === "role").length} roles · {entries.filter((e) => e.kind === "project").length} projects</div>
          </div>
        )}

        {active === "Leadership" && (
          <div className="bg-white border border-[#ECEAE4] p-5">
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-3">How I Work</div>
            <div className="space-y-[6px]">{arch.map((a) => <div key={a} className="font-poppins text-[13px] font-medium">{a}</div>)}</div>
            {ledTeam && (
              <>
                <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-3 mt-5 pt-4 border-t border-[#ECEAE4]">Leadership Snapshot</div>
                <div className="grid grid-cols-3 gap-3">
                  <PvStat v={yearsLed} l="Leading" /><PvStat v={largestTeam} l="Largest team" /><PvStat v={orgs} l="Orgs" />
                </div>
                <div className="text-[12px] text-[#3a352f] mt-3 italic leading-snug">&ldquo;{philosophy}&rdquo;</div>
              </>
            )}
          </div>
        )}

        {active === "Work With Me" && (
          <div className="space-y-3">
            {ftEnabled && (
              <div className="bg-white border border-[#ECEAE4] p-4">
                <div className="font-poppins text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#3a352f] mb-1">Full-time</div>
                <div className="font-poppins text-[15px] font-semibold">Open to full-time</div>
                <div className="text-[12px] text-[#7d7a74] mt-0.5">{ftRoles}</div>
                <button className="w-full mt-3 bg-brand-ink text-white font-poppins text-[12.5px] font-medium py-[9px]">Get in touch</button>
              </div>
            )}
            {offers.filter((o) => o.added).map((o) => (
              <div key={o.key} className="bg-white border border-[#ECEAE4] p-4">
                <div className="font-poppins text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#6B4BD6] mb-1">{o.booking === "book" ? "Book instantly" : o.booking === "proposal" ? "Send proposal" : "Message"}</div>
                <div className="font-poppins text-[15px] font-semibold">{o.title}</div>
                <div className="text-[12px] text-[#3a352f] mt-0.5">{[o.length || o.duration || o.cadence, o.key === "advisory" ? "" : (o.showRate || o.key === "office") && o.rate ? `$${o.rate} ${o.unit}` : "Contact for rate"].filter(Boolean).join(" · ")}</div>
                {o.desc && <div className="text-[12px] text-[#7d7a74] mt-2 leading-snug">{o.desc}</div>}
                <button className="w-full mt-3 bg-brand-ink text-white font-poppins text-[12.5px] font-medium py-[9px]">{bookLabel(o.booking)}</button>
              </div>
            ))}
            {offers.some((o) => !o.added) && (
              <div className="pt-2">
                <div className="font-poppins text-[11px] font-semibold mb-2">More ways to work together</div>
                {offers.filter((o) => !o.added).map((o) => (
                  <div key={o.key} className="flex items-center justify-between py-[6px] text-[12.5px]"><span>{o.title}</span><span className="text-[#6B4BD6] font-medium cursor-pointer">+ Add</span></div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "Skills" && (() => {
          const top5 = skills.filter((s) => s.top).slice(0, 5);
          const lvl = (l: string) => SKILL_LEVELS.indexOf(l) + 1;
          const PER_CAT = 3;
          return (
            <div className="bg-white border border-[#ECEAE4] p-5">
              <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-2">Top Skills</div>
              <div className="flex flex-wrap gap-[6px] mb-4">
                {top5.length ? top5.map((s) => <span key={s.name} className="font-poppins text-[12px] font-medium py-[4px] px-[10px] bg-brand-ink text-white">{s.name}</span>) : <span className="text-[12px] text-[#7d7a74]">Star up to 5.</span>}
              </div>

              <div className="flex items-baseline justify-between mb-2 pt-3 border-t border-[#ECEAE4]">
                <span className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74]">Skill Map</span>
                <span className="text-[9.5px] text-[#a8a29a]">by category</span>
              </div>
              <div className="space-y-3">
                {SKILL_CATEGORIES.map((cat) => {
                  const inCat = skills.filter((s) => catOf(s.name) === cat).sort((a, b) => lvl(b.level) - lvl(a.level));
                  if (!inCat.length) return null;
                  const show = inCat.slice(0, PER_CAT);
                  const more = inCat.length - show.length;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-baseline mb-1.5"><span className="font-poppins text-[10.5px] font-semibold text-[#3a352f]">{cat}</span><span className="text-[9.5px] text-[#a8a29a]">{inCat.length}</span></div>
                      {show.map((s) => (
                        <div key={s.name} className="mb-[6px]">
                          <div className="flex justify-between items-baseline mb-[2px]"><span className="font-poppins text-[11px]">{s.name}</span><span className="text-[9px] text-[#a8a29a]">{s.level}</span></div>
                          <div className="relative h-[7px]">
                            <div className="absolute inset-0 flex">{[0, 1, 2, 3].map((c) => <div key={c} className={`flex-1 bg-[#F6F4F0] ${c < 3 ? "border-r border-[#EAE7DF]" : ""}`} />)}</div>
                            <div className="absolute top-0 left-0 h-full" style={{ width: `${lvl(s.level) * 25}%`, background: typeOf(s.name) === "hard" ? "linear-gradient(90deg,#C7B5EE,#6B4BD6)" : "repeating-linear-gradient(45deg,#CDBFEF,#CDBFEF 3px,#E7DFF9 3px,#E7DFF9 6px)" }} />
                          </div>
                        </div>
                      ))}
                      {more > 0 && <div className="font-poppins text-[10px] text-[#6B4BD6] cursor-pointer mt-0.5">+{more} more</div>}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-3 pt-2 text-[10px] text-[#7d7a74]">
                <span className="inline-flex items-center gap-1"><span className="w-[10px] h-[8px] inline-block" style={{ background: "linear-gradient(90deg,#C7B5EE,#6B4BD6)" }} /> Hard</span>
                <span className="inline-flex items-center gap-1"><span className="w-[10px] h-[8px] inline-block" style={{ background: "repeating-linear-gradient(45deg,#CDBFEF,#CDBFEF 3px,#E7DFF9 3px,#E7DFF9 6px)" }} /> Soft</span>
                <span className="text-[#a8a29a]">· auto-sorted</span>
              </div>

              {learning.length > 0 && (
                <>
                  <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-2 mt-4 pt-3 border-t border-[#ECEAE4]">Currently Learning</div>
                  <div className="flex flex-wrap gap-[6px]">{learning.map((k) => <span key={k} className="font-poppins text-[11px] py-[2px] px-[8px] bg-[#EAF6E4] text-[#4f7a43]">↗ {k}</span>)}</div>
                </>
              )}

              <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-2 mt-4 pt-3 border-t border-[#ECEAE4]">Industries</div>
              <div className="flex flex-wrap gap-[6px]">{industries.map((t) => <span key={t} className="font-poppins text-[11.5px] py-[3px] px-[8px] bg-[#F4F2EF]">{t}</span>)}</div>
            </div>
          );
        })()}

        {active === "Impact" && (
          <div className="bg-white border border-[#ECEAE4] p-5">
            <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-3">Impact</div>
            {impacts.map((im, i) => (
              <div key={i} className="py-3 border-t border-[#ECEAE4] first:border-t-0 first:pt-0">
                <div className="font-poppins text-[14px] font-semibold leading-snug">{im.headline || "Your highlight"}</div>
                <div className="font-poppins text-[11.5px] text-[#6B4BD6] mt-0.5">{im.context}</div>
                <div className="text-[12px] text-[#7d7a74] mt-1 leading-snug">{im.story}</div>
              </div>
            ))}
          </div>
        )}

        {active === "Superpowers" && (() => {
          const filled = powers.filter((p) => p.statement.trim());
          return (
            <div className="bg-white border border-[#ECEAE4] p-5">
              <div className="font-poppins text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7d7a74] mb-3">Superpowers</div>
              {filled.length ? (
                <>
                  {filled.slice(0, SP_SHOWCASE).map((p, i) => (
                    <div key={i} className="flex gap-2.5 py-3 border-t border-[#ECEAE4] first:border-t-0 first:pt-0">
                      <span className="font-poppins text-[13px] font-semibold text-[#6B4BD6] tabular-nums shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="font-poppins text-[13.5px] font-semibold leading-snug">{p.statement}</div>
                        {p.proof && <div className="text-[12px] text-[#7d7a74] mt-1 leading-snug">{p.proof}</div>}
                      </div>
                    </div>
                  ))}
                  {filled.length > SP_SHOWCASE && (
                    <div className="mt-3 pt-3 border-t border-[#ECEAE4]"><span className="font-poppins text-[12px] font-medium text-[#6B4BD6] cursor-pointer">See all {filled.length} superpowers →</span><div className="text-[10.5px] text-[#a8a29a] mt-0.5">Opens the Superpowers section in your bio</div></div>
                  )}
                </>
              ) : <div className="text-[12.5px] text-[#7d7a74]">Write the thing you&apos;re uniquely great at.</div>}
            </div>
          );
        })()}
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, max, textarea }: { label: string; value: string; onChange: (v: string) => void; max?: number; textarea?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="font-poppins text-[13px] font-semibold">{label}</label>
        {max ? <span className="text-[11px] text-[#7d7a74]">{value.length} / {max}</span> : null}
      </div>
      {textarea ? (
        <textarea value={value} maxLength={max} rows={3} onChange={(e) => onChange(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink resize-none" />
      ) : (
        <input value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
      )}
    </div>
  );
}

function SocialField({ label, v, on, ph }: { label: string; v: string; on: (x: string) => void; ph: string }) {
  return (
    <div>
      <label className="font-poppins text-[12px] text-[#7d7a74] block mb-1">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} placeholder={ph} className="w-full font-inter text-[13.5px] py-[9px] px-[12px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
    </div>
  );
}

function MiniStat({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <input value={value} inputMode="numeric" onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} className="w-full font-poppins text-[20px] font-semibold py-[6px] px-[8px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
      <div className="text-[11px] text-[#7d7a74] mt-1">{label}</div>
    </div>
  );
}

function PvStat({ v, l }: { v: string; l: string }) {
  return <div><div className="font-poppins text-[18px] font-semibold">{v}</div><div className="text-[10.5px] text-[#7d7a74]">{l}</div></div>;
}
