"use client";

// PREVIEW of the rebuilt questionnaire — public route (no auth) so Sarah can eyeball it live.
// Step-by-step build. Once approved, moves into /onboard with real state + persistence, reusing existing editors.

import { useState, useEffect, useMemo, useRef } from "react";
import { ARCHETYPES } from "@/lib/archetypes";
import { BookingSetup } from "./BookingSetup";
import { SiteScan } from "./SiteScan";
import { SESSION_LENGTHS, parseMinutes, parsePriceCents, proRataDollars } from "@/lib/booking";
import { COMPANY_STAGES, COMPANY_INDUSTRY_MAX, INDUSTRY_SUGGESTIONS, PROJECT_TYPES as ENTRY_TYPES } from "@/lib/company-tags";
import { Logo } from "@/components/Logo";
import { createBrowserSupabase } from "@/lib/supabase";
import type { ResumeParseResult } from "@/types";
import { builderToProfile } from "@/lib/builder-to-profile";
import { SKILLS_LIBRARY, SKILL_CATEGORIES as LIB_CATS } from "@/lib/skills-library";

const RAIL = [
  { label: null, steps: ["Resume"] },
  { label: "Build your profile", steps: ["About You", "Long Bio", "Experience", "Leadership", "Impact", "Skills", "Superpowers", "Values", "Testimonials", "Education"] },
  { label: "Build your brand", steps: ["Actions", "Work With Me", "Media", "Reach", "Shop"] },
];
const ALL_STEPS = RAIL.flatMap((p) => p.steps);
const BUILT = new Set(["Resume", "About You", "Experience", "Leadership", "Impact", "Skills", "Superpowers", "Values", "Testimonials", "Education", "Actions", "Work With Me", "Media", "Reach", "Shop", "Long Bio"]);
// Steps whose section can be hidden from the public profile (About/Resume/Long Bio are core).
const HIDEABLE: Record<string, string> = { Experience: "experience", Leadership: "leadership", Impact: "impact", Skills: "skills", Superpowers: "superpowers", Values: "values", Testimonials: "testimonials", Education: "education", "Work With Me": "workwith", Media: "media", Reach: "reach", Shop: "store", Actions: "actions" };
const LOOKS = [
  { key: "classic", name: "Classic", note: "Black, white, beige", sw: ["#FFFFFF", "#111111", "#E9E6DF", "#670821"] },
  { key: "warm", name: "Warm", note: "Paper, sage, sky", sw: ["#F7F6F2", "#670821", "#A8CFFF", "#EED0BF"] },
  { key: "mono", name: "Mono", note: "Stone, light to dark", sw: ["#F7F6F2", "#E2DED5", "#CFC9BE", "#2E2C28"] },
  { key: "bold", name: "Bold", note: "Black, lavender, wine", sw: ["#FFFFFF", "#111111", "#C7B5FF", "#670821"] },
];
const ACTION_TYPES = ["Contact", "Hire", "Book", "Partner", "Sponsor", "Read", "Listen", "Watch", "Attend", "Join", "Apply", "Buy", "Shop", "Invest", "Donate", "Follow"];
const ACTION_DESTS = [{ v: "contact", label: "Opens Work with me" }, { v: "media", label: "My Media page" }, { v: "bio", label: "My full bio" }, { v: "experience", label: "My Experience page" }, { v: "work-with-me", label: "My Work with Me page" }, { v: "shop", label: "My Shop page" }, { v: "link", label: "A link (URL)" }];
const REACH_PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Substack", "X", "Podcast", "Facebook"];
// Onboarding guide — a layer ON TOP of the dashboard that walks a first-timer through the
// same left-nav sections (profile first, then brand). The real editors stay in place; the
// guide just advances the active section + narrates. Skippable at any point.
const TOUR_STEPS = ALL_STEPS.filter((s) => s !== "Resume"); // the 13 build sections, in nav order
const TOUR_HINTS: Record<string, string> = {
  "About You": "Your name, location, and the one line that says who you are.",
  "Experience": "The roles and projects that built you.",
  "Leadership": "How you lead — your archetype and style.",
  "Impact": "The highlights that actually moved the needle.",
  "Skills": "What you’re fluent in.",
  "Superpowers": "The handful of things you’re uniquely great at.",
  "Values": "What you won’t compromise on.",
  "Testimonials": "Words from people you’ve worked with.",
  "Education": "Schools, degrees, and certifications.",
  "Work With Me": "How people can hire, book, or work with you.",
  "Media": "Press, talks, writing, and portfolio.",
  "Shop": "Productize your expertise — templates, guides, courses.",
  "Long Bio": "The full narrative, in your own words.",
};
const RELATIONSHIPS = ["Manager", "Peer", "Direct report", "Client", "Mentor", "Partner", "Investor", "Me"]; // "Me" = a quote in your own words
const STORE_KINDS = ["Template", "Guide", "Course", "Ebook", "Download"];
const MEDIA_KINDS = ["Press", "Talk", "Podcast", "Writing", "Portfolio", "Video", "Deck"];
const MEDIA_FEATURED = 4;
// Branded fallback colors when a media item has no cover image (never gray).
const MEDIA_COLORS: Record<string, string> = {
  Press: "#E6E2D0", Talk: "#C0DDFB", Podcast: "#A9C89A", Writing: "#D6E27B",
  Portfolio: "#B9E3A5", Video: "#FF5436", Deck: "#DBCDC4",
};
const VALUES = ["Integrity", "Directness", "Curiosity", "Craft", "Ownership", "Empathy", "Ambition", "Candor", "Autonomy", "Impact", "Growth", "Transparency", "Resilience", "Kindness", "Rigor", "Creativity", "Collaboration", "Humility", "Optimism", "Pragmatism", "Trust", "Courage", "Discipline", "Generosity", "Focus", "Adaptability", "Accountability", "Vision", "Inclusion", "Balance", "Independence", "Boldness", "Patience", "Gratitude", "Fairness", "Simplicity", "Authenticity", "Service"];
const VAL_MAX = 12, VAL_FEATURED = 6;
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
const LIB_CAT: Record<string, string> = Object.fromEntries(SKILLS_LIBRARY.map((s) => [s.name.toLowerCase(), s.category]));
const catOf = (n: string) => LIB_CAT[n.trim().toLowerCase()] ?? "Other";
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

type Offer = { key: string; title: string; blurb: string; added: boolean; kind: string; length: string; duration: string; rate: string; unit: string; hoursPerMonth: string; showRate: boolean; extra?: { min: number; price: string }[]; keywords: string; date: string; cadence: string; stage?: string; industries?: string; booking: string; desc: string };
const UNITS = ["per hour", "per day", "per week", "per month", "per session", "per event", "per project"];
const STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Growth", "Public"];
const BOOKING_OPTS: Record<string, { v: string; label: string }[]> = {
  office: [{ v: "book", label: "Book instantly" }, { v: "request", label: "Send request" }],
  coaching: [{ v: "book", label: "Book instantly" }, { v: "request", label: "Send request" }],
  fractional: [{ v: "request", label: "Send request" }, { v: "proposal", label: "Request a proposal" }],
  project: [{ v: "request", label: "Send request" }, { v: "proposal", label: "Request a proposal" }],
  speaking: [{ v: "request", label: "Send request" }, { v: "proposal", label: "Request a proposal" }],
  advisory: [{ v: "request", label: "Send request" }],
  content: [{ v: "request", label: "Send request" }],
};
const KEYWORD_LABEL: Record<string, string> = { office: "Things I can advise on", coaching: "What I coach on", fractional: "Roles you're open to", project: "Types of projects", speaking: "Topics", advisory: "Types of companies you advise", content: "Content types" };
const bookLabel = (b: string) => (b === "book" ? "Book time" : b === "proposal" ? "Request a proposal" : "Send request");

// Blank canvas for a new user (no draft yet) — the 7 offering types available but none added.
const BLANK_OFFERS: Offer[] = [
  { key: "office", title: "Office Hours", blurb: "Focused 1:1 sessions.", added: false, kind: "", length: "60 minutes", duration: "", rate: "", unit: "per session", hoursPerMonth: "", showRate: true, keywords: "", date: "", cadence: "", booking: "book", desc: "" },
  { key: "fractional", title: "Fractional Role", blurb: "Join a company part-time.", added: false, kind: "", length: "", duration: "", rate: "", unit: "per month", hoursPerMonth: "", showRate: true, keywords: "", date: "", cadence: "", booking: "proposal", desc: "" },
  { key: "project", title: "Project Work", blurb: "Fixed-scope engagements.", added: false, kind: "", length: "", duration: "", rate: "", unit: "per project", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "proposal", desc: "" },
  { key: "speaking", title: "Speaking", blurb: "Events, podcasts & workshops.", added: false, kind: "Event", length: "", duration: "", rate: "", unit: "per event", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "proposal", desc: "" },
  { key: "advisory", title: "Advisory Board", blurb: "Board & advisory roles.", added: false, kind: "", length: "", duration: "", rate: "", unit: "", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "request", desc: "" },
  { key: "coaching", title: "Coaching", blurb: "1:1 coaching.", added: false, kind: "", length: "45 minutes", duration: "", rate: "", unit: "per session", hoursPerMonth: "", showRate: true, keywords: "", date: "", cadence: "", booking: "book", desc: "" },
  { key: "content", title: "Content Partnership", blurb: "Creator & sponsored work.", added: false, kind: "", length: "", duration: "", rate: "", unit: "per post", hoursPerMonth: "", showRate: false, keywords: "", date: "", cadence: "", booking: "request", desc: "" },
];
const BLANK = {
  types: [] as string[], name: "", headline: "", bio: "", photoUrl: "", city: "", loc: "Remote", openNow: true, dob: "",
  socials: { website: "", linkedin: "", instagram: "", x: "", tiktok: "", youtube: "", substack: "" },
  focus: "", entries: [] as Entry[], arch: [] as string[], mbti: "", enn: "", disc: "",
  ledTeam: false, yearsLed: "", largestTeam: "", orgs: "", philosophy: "",
  ftEnabled: false, ftRoles: "", offers: BLANK_OFFERS,
  impacts: [] as { headline: string; context: string; story: string }[],
  skills: [] as { name: string; level: string; top: boolean }[],
  industries: [] as string[], learning: [] as string[],
  vals: [] as string[], vFeatured: [] as string[],
  media: [] as { kind: string; title: string; outlet: string; url: string; featured: boolean; img?: string }[],
  testis: [] as { quote: string; author: string; role: string; relationship: string; featured: boolean }[],
  edu: [] as { school: string; degree: string; field: string; year: string }[],
  certs: [] as string[],
  products: [] as { kind: string; title: string; blurb: string; price: string; featured: boolean; url?: string }[],
  longBio: "", powers: [] as { statement: string; proof: string; keywords: string[] }[],
  hidden: [] as string[],
  reach: [] as { key: string; handle: string; followers: string; engagement: string; url: string }[],
  audAge: "", audGender: "", audGeo: "", calLink: "",
  actions: [] as { type: string; label: string; dest: string; url: string }[],
  look: "classic", previous: [] as string[], photoPos: { x: 50, y: 25 }, photoZoom: 1, ennWing: "",
};

const TYPES = ["Professional", "Executive", "Entrepreneur", "Creative", "Coach", "Creator", "Student"];
const WORK_LOC = ["Remote", "Hybrid", "In-Person"];
const PROJECT_TYPES = ["Product Launch", "Campaign", "Fundraising", "Acquisition", "Redesign", "Product Development"];
const MBTI = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP", "I don't know"];
const ENNEAGRAM = ["1 · Reformer", "2 · Helper", "3 · Achiever", "4 · Individualist", "5 · Investigator", "6 · Loyalist", "7 · Enthusiast", "8 · Challenger", "9 · Peacemaker", "I don't know"];
const DISC = ["D · Dominance", "I · Influence", "S · Steadiness", "C · Conscientiousness", "I don't know"];

// A timeline entry is EITHER a role (a job) OR a project (standalone work). Same level.
type Entry = { kind: "role" | "project"; logo?: string; industries?: string[]; stage?: string; ptype?: string; primary: string; secondary: string; dates: string; desc: string; result: string; featured: boolean };

export default function BuildPreview() {
  const [active, setActive] = useState("Resume"); // new users start at the top; returning users are repositioned on load
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  // Onboarding guide state: "welcome" intro → 0..12 walking the sections → "done" → null (dismissed)
  const [tour, setTour] = useState<"welcome" | number | "done" | null>("welcome");
  const tourGroup = (i: number) => (i < 9 ? "Build your profile" : "Build your brand");
  const startTour = () => { setTour(0); setActive(TOUR_STEPS[0]); };
  const tourGo = (i: number) => {
    if (i >= TOUR_STEPS.length) { setTour("done"); return; }
    setActive(TOUR_STEPS[i]);
    setTour(i);
  };

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
  const addEntryIndustry = (i: number, raw: string) => {
    const v = raw.trim().replace(/,$/, "").trim(); if (!v) return;
    setEntries((es) => es.map((x, j) => { if (j !== i) return x; const cur = x.industries || []; return cur.length >= COMPANY_INDUSTRY_MAX || cur.some((t) => t.toLowerCase() === v.toLowerCase()) ? x : { ...x, industries: [...cur, v] }; }));
  };
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
  const [tagDraft, setTagDraft] = useState("");
  const offerTags = (kw: string) => (kw || "").split(",").map((t) => t.trim()).filter(Boolean);
  const addOfferTag = (key: string, kw: string, tag: string) => { const t = tag.trim(); if (t && !offerTags(kw).some((x) => x.toLowerCase() === t.toLowerCase())) upOffer(key, { keywords: [...offerTags(kw), t].join(", ") }); setTagDraft(""); };
  const rmOfferTag = (key: string, kw: string, tag: string) => upOffer(key, { keywords: offerTags(kw).filter((x) => x !== tag).join(", ") });

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
  const [skillQuery, setSkillQuery] = useState("");
  const addSkill = (name: string) => { const v = name.trim(); if (!v) return; if (!skills.some((s) => s.name.toLowerCase() === v.toLowerCase())) setSkills((s) => [...s, { name: v, level: "Proficient", top: false }]); setSkillQuery(""); };
  const IND_MAX = 12;
  const [indDraft, setIndDraft] = useState("");
  const toggleIndustry = (t: string) => setIndustries((c) => (c.includes(t) ? c.filter((x) => x !== t) : c.length >= IND_MAX ? c : [...c, t]));
  const addIndustry = () => { const v = indDraft.trim(); if (v && !industries.some((x) => x.toLowerCase() === v.toLowerCase()) && industries.length < IND_MAX) setIndustries((c) => [...c, v]); setIndDraft(""); };
  const [hidden, setHidden] = useState<string[]>([]);
  const toggleHidden = (k: string) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));

  // Values — choose up to 12; star up to 6 "Core Values" that show on the home page, the rest live on Experience.
  const [vals, setVals] = useState<string[]>(["Directness", "Curiosity", "Craft", "Ownership", "Candor", "Growth", "Empathy", "Ambition"]);
  const [vFeatured, setVFeatured] = useState<string[]>(["Directness", "Curiosity", "Craft", "Ownership"]);
  const toggleVal = (v: string) => {
    if (vals.includes(v)) { setVals((c) => c.filter((x) => x !== v)); setVFeatured((f) => f.filter((x) => x !== v)); }
    else if (vals.length < VAL_MAX) setVals((c) => [...c, v]);
  };
  const toggleVFeatured = (v: string) => setVFeatured((c) => (c.includes(v) ? c.filter((x) => x !== v) : c.length < VAL_FEATURED ? [...c, v] : c));

  // Media — press, talks, writing, podcasts, portfolio. Star to feature in the profile gallery; rest in bio.
  type Media = { kind: string; title: string; outlet: string; url: string; featured: boolean; img?: string };
  const [media, setMedia] = useState<Media[]>([
    { kind: "Press", title: "The operators rebuilding personal branding", outlet: "TechCrunch", url: "", featured: true },
    { kind: "Talk", title: "Category creation in a crowded market", outlet: "SaaStr 2024", url: "", featured: true },
    { kind: "Podcast", title: "Building Marquee in public", outlet: "Lenny's Podcast", url: "", featured: true },
    { kind: "Writing", title: "Why the resume is dead", outlet: "Substack", url: "", featured: false },
    { kind: "Portfolio", title: "Hello Alice community platform", outlet: "Case study", url: "", featured: false },
  ]);
  const upMedia = (i: number, patch: Partial<Media>) => setMedia((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addMedia = () => setMedia((m) => [...m, { kind: "Press", title: "", outlet: "", url: "", featured: false }]);
  const rmMedia = (i: number) => setMedia((m) => m.filter((_, j) => j !== i));
  const toggleMediaFeatured = (i: number) => setMedia((m) => m.map((x, j) => { if (j !== i) return x; if (!x.featured && m.filter((y) => y.featured).length >= MEDIA_FEATURED) return x; return { ...x, featured: !x.featured }; }));

  // Testimonials — words from people you've worked with; feature up to 2, rest in bio.
  type Testi = { quote: string; author: string; role: string; relationship: string; featured: boolean };
  const [testis, setTestis] = useState<Testi[]>([
    { quote: "One of the sharpest operators I've worked with — she turned our fuzzy positioning into a category story customers actually repeat.", author: "Jordan Lee", role: "CEO, Meridian", relationship: "Manager", featured: true },
    { quote: "Builds teams that ship. Sets a clear bar and gets people to their best work.", author: "Priya Shah", role: "VP Product, Brex", relationship: "Peer", featured: true },
    { quote: "Rare mix of brand taste and growth rigor — our pipeline tripled under her.", author: "Marco Ruiz", role: "Founder, Hello Alice", relationship: "Client", featured: false },
  ]);
  const upTesti = (i: number, patch: Partial<Testi>) => setTestis((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addTesti = () => setTestis((m) => [...m, { quote: "", author: "", role: "", relationship: "Peer", featured: false }]);
  const rmTesti = (i: number) => setTestis((m) => m.filter((_, j) => j !== i));
  const toggleTestiFeatured = (i: number) => setTestis((m) => m.map((x, j) => { if (j !== i) return x; if (!x.featured && m.filter((y) => y.featured).length >= 2) return x; return { ...x, featured: !x.featured }; }));

  // Education — schools, degrees, certs.
  type Edu = { school: string; degree: string; field: string; year: string };
  const [edu, setEdu] = useState<Edu[]>([
    { school: "Stanford University", degree: "B.S.", field: "Industrial Engineering", year: "2008" },
    { school: "Reforge", degree: "Certificate", field: "Product Marketing", year: "2021" },
  ]);
  const upEdu = (i: number, patch: Partial<Edu>) => setEdu((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addEdu = () => setEdu((m) => [...m, { school: "", degree: "", field: "", year: "" }]);
  const rmEdu = (i: number) => setEdu((m) => m.filter((_, j) => j !== i));
  const [certs, setCerts] = useState<string[]>(["PMA Certified", "Google Analytics IQ", "HubSpot Marketing"]);
  const upCert = (i: number, v: string) => setCerts((c) => c.map((x, j) => (j === i ? v : x)));
  const addCert = () => setCerts((c) => [...c, ""]);
  const rmCert = (i: number) => setCerts((c) => c.filter((_, j) => j !== i));

  // Store — productized offerings you sell.
  type Product = { kind: string; title: string; blurb: string; price: string; featured: boolean; url?: string };
  const [products, setProducts] = useState<Product[]>([
    { kind: "Template", title: "The GTM Launch Kit", blurb: "Notion templates + checklists to launch a category.", price: "48", featured: true },
    { kind: "Guide", title: "Positioning Playbook", blurb: "My step-by-step framework for category creation.", price: "29", featured: true },
    { kind: "Course", title: "Community-Led Growth", blurb: "A 4-week cohort on building distribution.", price: "250", featured: false },
  ]);
  const upProduct = (i: number, patch: Partial<Product>) => setProducts((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addProduct = () => setProducts((m) => [...m, { kind: "Template", title: "", blurb: "", price: "", featured: false }]);
  type ReachP = { key: string; handle: string; followers: string; engagement: string; url: string };
  const [reach, setReach] = useState<ReachP[]>([]);
  const [audAge, setAudAge] = useState("");
  const [audGender, setAudGender] = useState("");
  const [audGeo, setAudGeo] = useState("");
  const addReach = (key: string) => setReach((r) => (r.some((x) => x.key === key) ? r : [...r, { key, handle: "", followers: "", engagement: "", url: "" }]));
  const upReach = (key: string, patch: Partial<ReachP>) => setReach((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const rmReach = (key: string) => setReach((r) => r.filter((x) => x.key !== key));
  const [calLink, setCalLink] = useState("");
  const [look, setLook] = useState("classic");
  const [photoPos, setPhotoPos] = useState({ x: 50, y: 25 });
  const [photoZoom, setPhotoZoom] = useState(1);
  const [ennWing, setEnnWing] = useState("");
  const [previous, setPrevious] = useState<string[]>([]);
  const [prevDraft, setPrevDraft] = useState("");
  const PREV_MAX = 8;
  const addPrevious = () => { const v = prevDraft.trim().replace(/,$/, "").trim(); if (v && !previous.some((x) => x.toLowerCase() === v.toLowerCase()) && previous.length < PREV_MAX) setPrevious((c) => [...c, v]); setPrevDraft(""); };
  type ActionRow = { type: string; label: string; dest: string; url: string };
  const [actions, setActions] = useState<ActionRow[]>([]);
  const upAction = (i: number, patch: Partial<ActionRow>) => setActions((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addAction = () => setActions((a) => (a.length < 4 ? [...a, { type: "Contact", label: "", dest: "contact", url: "" }] : a));
  const rmAction = (i: number) => setActions((a) => a.filter((_, j) => j !== i));
  const rmProduct = (i: number) => setProducts((m) => m.filter((_, j) => j !== i));
  const toggleProductFeatured = (i: number) => setProducts((m) => m.map((x, j) => { if (j !== i) return x; if (!x.featured && m.filter((y) => y.featured).length >= 3) return x; return { ...x, featured: !x.featured }; }));

  // Long Bio — the full narrative; also hosts overflow (all superpowers / values / media).
  const [longBio, setLongBio] = useState("I build systems, brands, and communities that drive growth — and I've spent the last decade doing it across the creator economy and B2B SaaS.\n\nMy through-line is category creation: taking something with a muddy story and turning it into a movement people repeat. I've done it at Hello Alice (1.5M members), at Brex, and now at Meridian.\n\nOutside my day job I advise founders, speak, and write The Positioning Memo. If your work doesn't fit on one line, we'll get along.");

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

  // ── Persistence (Milestone 1): auth'd autosave to a fresh builder_drafts row (no ELVISS). ──
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  // Resume step (Milestone 2)
  const [resumeMode, setResumeMode] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseErr, setParseErr] = useState("");
  const applyParsed = (p: ResumeParseResult) => {
    if (p.full_name) setName(p.full_name);
    if (p.current_title) setHeadline(p.current_title);
    if (p.location) setCity(p.location);
    if (p.linkedin_url) setSocials((s) => ({ ...s, linkedin: p.linkedin_url as string }));
    if (p.work_history?.length) setEntries(p.work_history.map((w, i) => ({
      kind: "role" as const, primary: w.company || "", secondary: w.role_title || "",
      dates: [w.start_date, w.end_date].filter(Boolean).join(" – "),
      desc: Array.isArray(w.bullets) ? w.bullets.join(" ") : "", result: "", featured: i === 0,
    })));
    if (p.skills_extracted?.length) setSkills(p.skills_extracted.slice(0, 20).map((n, i) => ({ name: n, level: "Proficient", top: i < 5 })));
    if (p.education?.length) setEdu(p.education.map((e) => ({ school: e.institution || "", degree: e.degree || "", field: "", year: e.graduation_year ? String(e.graduation_year) : "" })));
  };
  const parseResume = async (file?: File) => {
    setParseErr(""); setParsing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setParseErr("Please log in first."); setParsing(false); return; }
      const fd = new FormData();
      if (file) fd.append("file", file); else fd.append("text", resumeText);
      fd.append("userId", user.id);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setParseErr(json.error || "Couldn't read that — try pasting the text instead."); setParsing(false); return; }
      applyParsed(json.parsed as ResumeParseResult);
      setActive("About You");
    } catch { setParseErr("Something went wrong. Try again."); }
    setParsing(false);
  };
  const snapshot = () => ({ types, name, headline, bio, photoUrl, city, loc, openNow, dob, socials, focus, entries, arch, mbti, enn, ennWing, disc, ledTeam, yearsLed, largestTeam, orgs, philosophy, ftEnabled, ftRoles, offers, impacts, skills, industries, learning, vals, vFeatured, media, testis, edu, certs, products, longBio, powers, hidden, reach, audAge, audGender, audGeo, calLink, actions, look, previous, photoPos, photoZoom });
  const uploadImg = async (file: File, prefix: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${prefix}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (error) { console.error("upload failed", error); alert("Upload failed — " + error.message); return null; }
      return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    } finally { setUploading(false); }
  };
  const hydrate = (d: Partial<typeof BLANK>) => {
    setTypes(d.types ?? []); setName(d.name ?? ""); setHeadline(d.headline ?? ""); setBio(d.bio ?? ""); setPhotoUrl(d.photoUrl ?? "");
    setCity(d.city ?? ""); setLoc(d.loc ?? "Remote"); setOpenNow(d.openNow ?? true); setDob(d.dob ?? "");
    setSocials(d.socials ?? BLANK.socials); setFocus(d.focus ?? ""); setEntries(d.entries ?? []);
    setArch(d.arch ?? []); setMbti(d.mbti ?? ""); setEnn(d.enn ?? ""); setDisc(d.disc ?? "");
    setLedTeam(d.ledTeam ?? false); setYearsLed(d.yearsLed ?? ""); setLargestTeam(d.largestTeam ?? ""); setOrgs(d.orgs ?? ""); setPhilosophy(d.philosophy ?? "");
    setFtEnabled(d.ftEnabled ?? false); setFtRoles(d.ftRoles ?? ""); setOffers(d.offers ?? BLANK_OFFERS);
    setImpacts(d.impacts ?? []); setSkills(d.skills ?? []); setIndustries(d.industries ?? []); setLearning(d.learning ?? []);
    setVals(d.vals ?? []); setVFeatured(d.vFeatured ?? []); setMedia(d.media ?? []); setTestis(d.testis ?? []);
    setEdu(d.edu ?? []); setCerts(d.certs ?? []); setProducts(d.products ?? []); setLongBio(d.longBio ?? ""); setPowers(d.powers ?? []); setHidden(d.hidden ?? []);
    setReach(d.reach ?? []); setAudAge(d.audAge ?? ""); setAudGender(d.audGender ?? ""); setAudGeo(d.audGeo ?? ""); setCalLink(d.calLink ?? ""); setActions(d.actions ?? []); setLook(d.look ?? "classic"); setPrevious(d.previous ?? []); setPhotoPos(d.photoPos ?? { x: 50, y: 25 }); setPhotoZoom(d.photoZoom ?? 1); setEnnWing(d.ennWing ?? "");
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setLoaded(true); return; }
      const { data, error } = await supabase.from("builder_drafts").select("data").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      // On a load failure, STOP: never hydrate BLANK (autosave would then overwrite the real draft).
      if (error) { setLoadErr("Couldn't load your saved draft. Refresh to try again — nothing has been changed."); return; }
      const saved = data?.data as Partial<typeof BLANK> | undefined;
      // "Returning" means they've actually entered something — an autosaved empty row is still a new user,
      // and so is a row holding only the name we filled in from their account.
      const accountName = String((user.user_metadata as { full_name?: string } | null)?.full_name || "").trim();
      const typedName = (saved?.name || "").trim();
      const hasDraft = !!(saved && ((typedName && typedName !== accountName) || (saved.headline || "").trim() || (saved.bio || "").trim() || (saved.entries?.length ?? 0) > 0 || (saved.skills?.length ?? 0) > 0));
      hydrate(saved && Object.keys(saved).length ? saved : BLANK);
      // First visit → Resume step + welcome tour. Returning → straight into editing, no tour.
      if (hasDraft) { setActive("About You"); setTour(null); } else { setActive("Resume"); setTour("welcome"); }
      const { data: pub } = await supabase.from("published_profiles").select("username").eq("user_id", user.id).maybeSingle();
      if (!cancelled && pub?.username) { setPubUsername(pub.username); setClaimed(true); }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("builder_drafts").upsert({ user_id: user.id, data: snapshot(), updated_at: new Date().toISOString() });
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, types, name, headline, bio, photoUrl, city, loc, openNow, dob, socials, focus, entries, arch, mbti, enn, disc, ledTeam, yearsLed, largestTeam, orgs, philosophy, ftEnabled, ftRoles, offers, impacts, skills, industries, learning, vals, vFeatured, media, testis, edu, certs, products, longBio, powers, hidden, reach, audAge, audGender, audGeo, calLink, actions, look, previous, photoPos, photoZoom, ennWing]);

  // Publish (Milestone 3) — map the snapshot to a Profile and write it live.
  const [showPublish, setShowPublish] = useState(false);
  const [pubUsername, setPubUsername] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pubResult, setPubResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const publish = async () => {
    const u = pubUsername.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!u) { setPubResult({ ok: false, msg: "Choose a username." }); return; }
    setPublishing(true); setPubResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPubResult({ ok: false, msg: "Please log in first." }); setPublishing(false); return; }
      // inquiryEmail powers the "Send request" form on the public profile — without it every inquiry errors.
      // Verified is granted by Marquee, not set in the builder — carry over what the live profile already has.
      const { data: live } = await supabase.from("published_profiles").select("profile").eq("username", u).eq("user_id", user.id).maybeSingle();
      const verified = !!(live?.profile as { verified?: boolean } | null)?.verified;
      const profile = { ...builderToProfile(snapshot(), u), verified, inquiryEmail: user.email || undefined };
      const { error } = await supabase.from("published_profiles").upsert({ username: u, user_id: user.id, profile, published_at: new Date().toISOString() });
      if (error) setPubResult({ ok: false, msg: "That username may be taken — try another." });
      else { setPubResult({ ok: true, msg: u }); setClaimed(true); setPubUsername(u); }
    } catch { setPubResult({ ok: false, msg: "Couldn't publish — try again." }); }
    setPublishing(false);
  };

  const stepNo = ALL_STEPS.indexOf(active);

  if (loadErr) return <div className="font-inter bg-brand-paper min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"><div className="font-sans text-[15px] text-brand-ink max-w-[46ch]">{loadErr}</div><button onClick={() => window.location.reload()} className="font-sans bg-brand-ink text-white text-[13px] font-medium py-[10px] px-5">Refresh</button></div>;
  if (!loaded) return <div className="font-inter bg-brand-paper min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#670821] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="font-inter text-brand-ink bg-brand-paper min-h-screen grid" style={{ gridTemplateColumns: "248px 1fr" }}>
      {/* ── RAIL ── */}
      <aside className="border-r border-[#ECEAE4] p-[26px_18px] sticky top-0 h-screen overflow-y-auto flex flex-col gap-[3px] bg-white">
        <div className="mb-7 pl-2 text-[18px]"><Logo /></div>
        {RAIL.map((phase, pi) => (
          <div key={pi}>
            {phase.label && <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.13em] text-[#7d7a74] mt-4 mb-2 ml-2">{phase.label}</div>}
            {phase.steps.map((s) => {
              const isActive = s === active, done = s === "Resume" || (BUILT.has(s) && s !== active);
              const n = s === "Resume" ? "✓" : ALL_STEPS.indexOf(s);
              return (
                <div key={s} onClick={() => setActive(s)} className={`flex items-center gap-[11px] py-2 px-[10px] cursor-pointer ${isActive ? "bg-[#EDE7FF]" : "hover:bg-[#F4F2EF]"}`}>
                  <span className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center text-[11px] font-semibold border-[1.5px] ${s === "Resume" ? "bg-brand-ink border-brand-ink text-white" : isActive ? "bg-[#670821] border-[#670821] text-white" : "border-[#E1DED7] text-[#7d7a74] bg-white"}`}>{s === "Resume" ? "✓" : n}</span>
                  <span className={`font-sans text-[13px] leading-tight ${isActive ? "text-[#670821] font-semibold" : "text-[#3a352f]"}`}>{s}{s === "Resume" ? <span className="block text-[11px] text-[#7d7a74] font-normal">Imported</span> : null}</span>
                </div>
              );
            })}
          </div>
        ))}
        {(() => { const parts = [name.trim(), headline.trim(), entries.length, skills.length, vals.length, powers.some((p) => p.statement?.trim()), testis.some((t) => t.quote?.trim()), edu.length, offers.some((o) => o.added), media.length, longBio.trim()]; const pct = Math.round((parts.filter(Boolean).length / parts.length) * 100); const title = pct >= 80 ? "Almost there" : pct >= 40 ? "Good progress" : "Getting started"; const sub = pct >= 80 ? "You're in the final stretch." : pct >= 40 ? "Keep going — it's taking shape." : "Add a few sections to bring it to life."; return <div className="mt-auto pt-5"><div className="border border-[#ECEAE4] p-[14px]"><div className="font-sans text-[14px] font-semibold">{title}</div><div className="text-[11.5px] text-[#7d7a74] mt-0.5 mb-[10px]">{sub}</div><div className="h-[6px] bg-[#ECEAE4]"><div className="h-full bg-[#670821] transition-all" style={{ width: `${pct}%` }} /></div><div className="text-[10.5px] text-[#a8a29a] mt-1">{pct}% complete</div></div></div>; })()}
      </aside>

      {/* ── MAIN ── */}
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-end items-center gap-4 py-5 px-10 border-b border-[#ECEAE4]">
          <button onClick={async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) await supabase.from("builder_drafts").upsert({ user_id: user.id, data: snapshot(), updated_at: new Date().toISOString() }); window.location.href = claimed && pubUsername ? `/${pubUsername}` : "/dashboard"; }} className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink">Save and exit</button>
          <a href="/dashboard" className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink">Dashboard</a>
          {claimed && pubUsername && <a href={`/${pubUsername}`} target="_blank" rel="noopener" className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink">View profile ↗</a>}
          <a href="/build-preview/preview" target="_blank" rel="noopener" className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink">Preview ↗</a>
          <button onClick={() => setShowPublish(true)} className="font-sans bg-brand-ink text-white text-[13px] font-medium py-[11px] px-5 inline-flex items-center gap-2">{claimed ? "Update →" : "Publish →"}</button>
        </div>

        <main className="p-[40px_48px] flex-1 max-w-[820px]">
          <div className="flex items-center justify-between mb-4 max-w-[980px] gap-3 flex-wrap">
            <span className="font-sans inline-block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#670821] bg-[#EDE7FF] py-[5px] px-[11px]">Step {stepNo + 1} of {ALL_STEPS.length} · {active}</span>
            {HIDEABLE[active] && (
              <button onClick={() => toggleHidden(HIDEABLE[active])} className="inline-flex items-center gap-2 font-sans text-[12px] text-[#57524c] hover:text-brand-ink">
                <span className={`w-[34px] h-[19px] rounded-full relative transition-colors ${hidden.includes(HIDEABLE[active]) ? "bg-[#d8d4cc]" : "bg-[#670821]"}`}><span className={`absolute top-[2px] w-[15px] h-[15px] bg-white rounded-full transition-all ${hidden.includes(HIDEABLE[active]) ? "left-[2px]" : "left-[17px]"}`} /></span>
                {hidden.includes(HIDEABLE[active]) ? "Hidden from your profile" : "Showing on your profile"}
              </button>
            )}
          </div>

          {active === "Resume" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Start with your resume.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Upload it and we&apos;ll pre-fill your experience, skills, education and links — you can edit everything after. Or skip and build from scratch.</p>
              <div className="inline-flex gap-1 bg-[#F4F2EF] p-1 mb-5">
                <button onClick={() => setResumeMode("file")} className={`font-sans text-[13px] font-medium py-[8px] px-[16px] ${resumeMode === "file" ? "bg-brand-ink text-white" : "text-[#3a352f]"}`}>Upload a file</button>
                <button onClick={() => setResumeMode("text")} className={`font-sans text-[13px] font-medium py-[8px] px-[16px] ${resumeMode === "text" ? "bg-brand-ink text-white" : "text-[#3a352f]"}`}>Paste text</button>
              </div>
              {resumeMode === "file" ? (
                <label className={`block max-w-[760px] border-[1.5px] border-dashed p-[40px] text-center cursor-pointer ${parsing ? "border-[#670821] bg-[#EDE7FF]" : "border-[#E1DED7] hover:border-brand-ink"}`}>
                  <input type="file" accept=".pdf,.txt,.md,.doc,.docx" disabled={parsing} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseResume(f); }} />
                  <div className="w-[44px] h-[44px] rounded-full bg-[#EDE7FF] mx-auto mb-3 flex items-center justify-center text-[18px] text-[#670821]">⭱</div>
                  <div className="font-sans text-[15px] font-semibold">{parsing ? "Reading your resume…" : "Drop your resume here, or click to browse"}</div>
                  <div className="text-[12.5px] text-[#7d7a74] mt-1">PDF or text file</div>
                </label>
              ) : (
                <div className="max-w-[760px]">
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} placeholder="Paste your resume text here…" className="w-full font-inter text-[13.5px] py-[12px] px-[14px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                  <button onClick={() => parseResume()} disabled={parsing || !resumeText.trim()} className="mt-3 font-sans bg-brand-ink text-white text-[13px] font-medium py-[11px] px-5 disabled:opacity-40">{parsing ? "Reading…" : "Read my resume →"}</button>
                </div>
              )}
              {parseErr && <div className="text-[13px] text-[#AB0000] mt-3 max-w-[760px]">{parseErr}</div>}
              <button onClick={() => setActive("About You")} className="block mt-6 font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink">Skip — I&apos;ll build from scratch →</button>
            </>
          )}

          {active === "About You" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Let's start with you.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">The basics that anchor your profile. You can change any of this later.</p>
              <div className="mb-7">
                <label className="font-sans text-[13px] font-semibold block mb-1">What kind of professional are you?</label>
                <p className="text-[13px] text-[#7d7a74] mb-3">Pick up to 3. This shapes how your profile is laid out.</p>
                <div className="flex flex-wrap gap-[10px]">
                  {TYPES.map((t) => { const on = types.includes(t); return <button key={t} onClick={() => toggleType(t)} className={`font-sans text-[14px] font-medium py-[11px] px-[18px] border-[1.5px] ${on ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-[#3a352f]"}`}>{t}</button>; })}
                </div>
              </div>
              <div className="mb-6">
                <label className="font-sans text-[13px] font-semibold block mb-2">Photo</label>
                <div className="flex items-center gap-3">
                  <label className="w-[88px] h-[88px] rounded-full border-[1.5px] border-dashed border-[#E1DED7] flex items-center justify-center text-[12px] text-[#7d7a74] cursor-pointer text-center leading-tight overflow-hidden hover:border-brand-ink shrink-0">
                    {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <span>Add<br />photo</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadImg(f, "avatar"); if (url) setPhotoUrl(url); } e.currentTarget.value = ""; }} />
                  </label>
                  {photoUrl && <button onClick={() => setPhotoUrl("")} className="font-sans text-[12px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button>}
                  {uploading && <span className="font-sans text-[12px] text-[#670821]">Uploading…</span>}
                </div>
                {photoUrl && <PhotoFramer url={photoUrl} pos={photoPos} zoom={photoZoom} onPos={setPhotoPos} onZoom={setPhotoZoom} />}
              </div>
              <div className="grid grid-cols-2 gap-[18px] max-w-[600px]"><Field label="Name" value={name} onChange={setName} /><Field label="City / State" value={city} onChange={setCity} /></div>
              <div className="max-w-[600px] mt-[18px]"><Field label="Headline" value={headline} onChange={setHeadline} max={60} /></div>
              <div className="max-w-[600px] mt-[18px]"><Field label="Quick facts" value={bio} onChange={setBio} max={200} textarea /><p className="text-[12px] text-[#7d7a74] mt-[6px]">Up to three short lines, shown under your title. Press Enter to start a new line.</p></div>
              <div className="max-w-[600px] mt-[18px]"><Field label="Currently" value={focus} onChange={setFocus} max={160} textarea /><p className="text-[12px] text-[#7d7a74] mt-[6px]">One or two sentences on what you are doing now. Shown in your header under the label “Currently”.</p></div>
              <div className="max-w-[600px] mt-[18px]">
                <div className="flex items-baseline justify-between mb-2"><label htmlFor="f-previous" className="font-sans text-[13px] font-semibold cursor-pointer">Previous</label><span className="text-[11px] text-[#7d7a74]">{previous.length} / {PREV_MAX}</span></div>
                <div className="flex flex-wrap items-center gap-[6px] border border-[#E1DED7] bg-white py-[6px] px-[8px] focus-within:border-brand-ink">
                  {previous.map((b) => <span key={b} className="inline-flex items-center gap-[6px] font-sans text-[13px] py-[5px] px-[10px] bg-[#F1EEE8] text-[#3a352f]">{b}<button onClick={() => setPrevious((c) => c.filter((x) => x !== b))} aria-label={`Remove ${b}`} className="text-[#7d7a74] hover:text-brand-ink">×</button></span>)}
                  {previous.length < PREV_MAX && <input id="f-previous" value={prevDraft} onChange={(e) => setPrevDraft(e.target.value)} onBlur={addPrevious} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addPrevious(); } }} placeholder={previous.length ? "add another…" : "Type a brand, press Enter"} className="flex-1 min-w-[150px] font-inter text-[13px] py-[5px] px-[6px] focus:outline-none" />}
                </div>
                <p className="text-[12px] text-[#7d7a74] mt-[6px]">Brands you have worked at or with. Shown at the bottom of your header, in this order.</p>
              </div>
              <div className="mt-6 max-w-[600px]">
                <label className="font-sans text-[13px] font-semibold block mb-1">Look</label>
                <p className="text-[12px] text-[#7d7a74] mb-[10px]">The colours of your profile. Layout and type are the same in all four.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
                  {LOOKS.map((l) => (
                    <button key={l.key} onClick={() => setLook(l.key)} aria-pressed={look === l.key} className={`h-[96px] flex flex-col justify-between text-left p-[12px] border-[1.5px] bg-white ${look === l.key ? "border-brand-ink" : "border-[#E1DED7] hover:border-[#a8a29a]"}`}>
                      <span className="grid grid-cols-4 w-[88px] h-[22px] border border-[#E1DED7]">{l.sw.map((c) => <span key={c} style={{ background: c }} />)}</span>
                      <span className="block">
                        <span className="font-sans text-[13px] font-semibold block leading-[1.2]">{l.name}</span>
                        <span className="font-sans text-[11.5px] text-[#7d7a74] block leading-[1.3] mt-[3px] whitespace-nowrap overflow-hidden text-ellipsis">{l.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6"><label className="font-sans text-[13px] font-semibold block mb-2">Preferred Work Location</label><div className="flex gap-[10px]">{WORK_LOC.map((w) => <button key={w} onClick={() => setLoc(w)} className={`font-sans text-[13px] py-[9px] px-[16px] border-[1.5px] ${loc === w ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{w}</button>)}</div></div>
              <label className="flex items-center gap-[10px] mt-[18px] cursor-pointer"><input type="checkbox" checked={openNow} onChange={() => setOpenNow(!openNow)} /><span className="font-sans text-[14px]">Open to opportunities now <span className="text-[#7d7a74]">· shows a small line above your name</span></span></label>
              <div className="mt-6 max-w-[600px]"><label className="font-sans text-[13px] font-semibold block mb-2">Links</label><div className="grid grid-cols-2 gap-[12px]">
                <SocialField label="Website" v={socials.website} on={(x) => setSocials((s) => ({ ...s, website: x }))} ph="yoursite.com" />
                <SocialField label="LinkedIn" v={socials.linkedin} on={(x) => setSocials((s) => ({ ...s, linkedin: x }))} ph="linkedin.com/in/you" />
                <SocialField label="Instagram" v={socials.instagram} on={(x) => setSocials((s) => ({ ...s, instagram: x }))} ph="instagram.com/you" />
                <SocialField label="X" v={socials.x} on={(x) => setSocials((s) => ({ ...s, x }))} ph="x.com/you" />
                <SocialField label="TikTok" v={socials.tiktok} on={(x) => setSocials((s) => ({ ...s, tiktok: x }))} ph="tiktok.com/@you" />
                <SocialField label="YouTube" v={socials.youtube} on={(x) => setSocials((s) => ({ ...s, youtube: x }))} ph="youtube.com/@you" />
                <SocialField label="Substack" v={socials.substack} on={(x) => setSocials((s) => ({ ...s, substack: x }))} ph="you.substack.com" />
              </div></div>
              <div className="mt-6 max-w-[280px]"><label className="font-sans text-[13px] font-semibold block mb-2">Date of birth <span className="font-normal text-[#7d7a74]">· private, never shown</span></label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" /></div>
            </>
          )}

          {active === "Experience" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your experience.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">We pulled your roles from your resume. Confirm them, add projects, and feature your best work.</p>

              <div className="font-sans text-[13px] font-semibold mb-1">Timeline</div>
              <p className="text-[12.5px] text-[#7d7a74] mb-3">Add your roles (full-time jobs) and your projects (consulting or client engagements). Both sit on your timeline. Star the ones to feature.</p>
              <div className="space-y-4 max-w-[980px]">
                {entries.map((e, i) => (
                  <div key={i} className="border border-[#E1DED7] p-[18px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-sans text-[10px] font-semibold uppercase tracking-[0.1em] py-[3px] px-[8px] ${e.kind === "role" ? "bg-[#EDE7FF] text-[#670821]" : "bg-[#F4F2EF] text-[#3a352f]"}`}>{e.kind === "role" ? "Role" : "Project"}</span>
                      <button onClick={() => upEntry(i, { featured: !e.featured })} className={`font-sans text-[11px] font-semibold py-[7px] px-[11px] border-[1.5px] whitespace-nowrap ${e.featured ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] text-[#7d7a74]"}`}>{e.featured ? "★ Featured" : "☆ Feature"}</button>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-none flex flex-col items-center gap-[4px]">
                        <label className="w-[46px] h-[46px] border border-[#E1DED7] bg-white flex items-center justify-center text-center cursor-pointer overflow-hidden hover:border-brand-ink" title={e.logo ? "Change logo" : "Add a logo"}>
                          {e.logo ? <img src={e.logo} alt="" className="w-full h-full object-contain p-[4px]" /> : <span className="text-[9px] text-[#7d7a74] leading-tight">Add<br />logo</span>}
                          <input type="file" accept="image/*" className="hidden" onChange={async (ev) => { const f = ev.target.files?.[0]; if (f) { const url = await uploadImg(f, "logo"); if (url) upEntry(i, { logo: url }); } ev.currentTarget.value = ""; }} />
                        </label>
                        {e.logo && <button onClick={() => upEntry(i, { logo: "" })} className="font-sans text-[10px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button>}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-[12px]">
                        <input value={e.primary} placeholder={e.kind === "role" ? "Company" : e.ptype === "Client" ? "Client name" : e.ptype === "Accelerator" || e.ptype === "Program" ? "Program name" : "What was the project?"} onChange={(ev) => upEntry(i, { primary: ev.target.value })} className="font-sans font-semibold text-[15px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                        <input value={e.dates} placeholder="2020 – 2023" onChange={(ev) => upEntry(i, { dates: ev.target.value })} className="font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      </div>
                    </div>
                    <input value={e.secondary} placeholder={e.kind === "role" ? "Your title" : e.ptype === "Client" ? "What you did for them" : e.ptype === "Accelerator" || e.ptype === "Program" ? "Who ran it, or your role" : "Client (who it was for)"} onChange={(ev) => upEntry(i, { secondary: ev.target.value })} className="w-full font-inter text-[14px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 focus:outline-none focus:border-brand-ink" />
                    <textarea value={e.desc} placeholder="What you did and what changed." onChange={(ev) => upEntry(i, { desc: ev.target.value })} rows={2} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none mt-2 focus:outline-none focus:border-brand-ink" />
                    {e.kind === "project" && (
                      <input value={e.result} placeholder="Result (optional), e.g. 1.5M members" onChange={(ev) => upEntry(i, { result: ev.target.value })} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 focus:outline-none focus:border-brand-ink" />
                    )}
                    {e.kind === "project" && (
                      <div className="mt-3">
                        <label className="font-sans text-[12px] font-semibold block mb-[6px]">What is this? <span className="font-normal text-[#a8a29a]">· shown as a label, so it reads differently from a job</span></label>
                        <div className="flex flex-wrap gap-[6px]">{ENTRY_TYPES.map((t) => <button key={t} onClick={() => upEntry(i, { ptype: t })} aria-pressed={(e.ptype || "Project") === t} className={`font-sans text-[12.5px] py-[5px] px-[10px] border ${(e.ptype || "Project") === t ? "border-brand-ink bg-[#F1EEE8]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-[#a8a29a]"}`}>{t}</button>)}</div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-[#ECEAE4] grid sm:grid-cols-2 gap-[14px]">
                      <div>
                        <div className="flex items-baseline justify-between mb-[6px]"><label htmlFor={`f-ind-${i}`} className="font-sans text-[12px] font-semibold">Industries <span className="font-normal text-[#a8a29a]">· up to {COMPANY_INDUSTRY_MAX}</span></label><span className="text-[11px] text-[#7d7a74]">{(e.industries || []).length} / {COMPANY_INDUSTRY_MAX}</span></div>
                        <div className="flex flex-wrap items-center gap-[6px] border border-[#E1DED7] bg-white py-[5px] px-[7px] focus-within:border-brand-ink">
                          {(e.industries || []).map((t) => <span key={t} className="inline-flex items-center gap-[6px] font-sans text-[12.5px] py-[4px] px-[9px] bg-[#F1EEE8] text-[#3a352f]">{t}<button onClick={() => upEntry(i, { industries: (e.industries || []).filter((x) => x !== t) })} aria-label={`Remove ${t}`} className="text-[#7d7a74] hover:text-brand-ink">×</button></span>)}
                          {(e.industries || []).length < COMPANY_INDUSTRY_MAX && <input id={`f-ind-${i}`} list="industry-suggestions" placeholder={(e.industries || []).length ? "add another…" : "e.g. Fintech"} className="flex-1 min-w-[110px] font-inter text-[12.5px] py-[4px] px-[5px] focus:outline-none"
                            onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === ",") { ev.preventDefault(); addEntryIndustry(i, ev.currentTarget.value); ev.currentTarget.value = ""; } }}
                            onChange={(ev) => { if (INDUSTRY_SUGGESTIONS.includes(ev.currentTarget.value)) { addEntryIndustry(i, ev.currentTarget.value); ev.currentTarget.value = ""; } }}
                            onBlur={(ev) => { addEntryIndustry(i, ev.currentTarget.value); ev.currentTarget.value = ""; }} />}
                        </div>
                      </div>
                      <div>
                        <label className="font-sans text-[12px] font-semibold block mb-[6px]">Stage or type <span className="font-normal text-[#a8a29a]">· pick one</span></label>
                        <div className="flex flex-wrap gap-[6px]">{COMPANY_STAGES.map((st) => <button key={st} onClick={() => upEntry(i, { stage: e.stage === st ? "" : st })} aria-pressed={e.stage === st} className={`font-sans text-[12.5px] py-[5px] px-[10px] border ${e.stage === st ? "border-brand-ink bg-[#F1EEE8]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-[#a8a29a]"}`}>{st}</button>)}</div>
                      </div>
                    </div>
                    <div className="text-right mt-2"><button onClick={() => rmEntry(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button></div>
                  </div>
                ))}
                <datalist id="industry-suggestions">{INDUSTRY_SUGGESTIONS.map((t) => <option key={t} value={t} />)}</datalist>
                <div className="flex gap-3">
                  <button onClick={() => addEntry("role")} className="flex-1 font-sans text-[13px] text-[#7d7a74] py-3 border-[2px] border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a role</button>
                  <button onClick={() => addEntry("project")} className="flex-1 font-sans text-[13px] text-[#7d7a74] py-3 border-[2px] border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a client, accelerator or project</button>
                </div>
              </div>
            </>
          )}

          {active === "Leadership" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">How you lead.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Share how you lead teams, make decisions, and collaborate.</p>

              <div className="mb-8">
                <label className="font-sans text-[13px] font-semibold block mb-1">Your archetype</label>
                <p className="text-[12.5px] text-[#7d7a74] mb-3">Pick up to 4.</p>
                <div className="grid grid-cols-2 gap-[10px] max-w-[620px]">
                  {ARCHETYPES.map((a) => { const on = arch.includes(a.name); return (
                    <button key={a.name} onClick={() => toggleArch(a.name)} className={`text-left p-[14px] border-[1.5px] ${on ? "border-[#670821] bg-[#EDE7FF]" : "border-[#E1DED7] bg-white hover:border-[#3a352f]"}`}>
                      <div className="font-sans text-[15px] font-semibold">{a.name}</div>
                      <div className="text-[12px] text-[#7d7a74] mt-0.5">{a.desc}</div>
                    </button>
                  ); })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-[14px] max-w-[620px] mb-8">
                <div><label className="font-sans text-[13px] font-semibold block mb-2">MBTI <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <select value={mbti} onChange={(e) => setMbti(e.target.value)} className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink"><option value="">Select</option>{MBTI.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div><label className="font-sans text-[13px] font-semibold block mb-2">Enneagram <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <select value={enn} onChange={(e) => { setEnn(e.target.value); setEnnWing(""); }} className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink"><option value="">Select</option>{ENNEAGRAM.map((m) => <option key={m}>{m}</option>)}</select>{/^\d/.test(enn) && (() => { const n = Number(enn[0]); const wings = [n === 1 ? 9 : n - 1, n === 9 ? 1 : n + 1]; return (
                    <select value={ennWing} onChange={(e) => setEnnWing(e.target.value)} aria-label="Enneagram wing" className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink mt-2"><option value="">No wing</option>{wings.map((w) => <option key={w} value={String(w)}>{n}w{w} (wing {w})</option>)}</select>
                  ); })()}</div>
                <div><label className="font-sans text-[13px] font-semibold block mb-2">DISC <span className="font-normal text-[#7d7a74]">· optional</span></label>
                  <input value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="e.g. DI, SC" className="w-full font-inter text-[13.5px] py-[10px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" /></div>
              </div>

              <div>
                <label className="font-sans text-[13px] font-semibold block mb-2">Have you led a team?</label>
                <div className="flex gap-[10px] mb-4">
                  {[true, false].map((v) => <button key={String(v)} onClick={() => setLedTeam(v)} className={`font-sans text-[13px] py-[9px] px-[20px] border-[1.5px] ${ledTeam === v ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{v ? "Yes" : "No"}</button>)}
                </div>
                {ledTeam && (
                  <div className="border border-[#E1DED7] p-[18px] max-w-[500px]">
                    <div className="grid grid-cols-3 gap-[12px] mb-2">
                      <MiniStat label="Years leading" value={yearsLed} onChange={setYearsLed} />
                      <MiniStat label="Largest team" value={largestTeam} onChange={setLargestTeam} />
                      <MiniStat label="Organizations" value={orgs} onChange={setOrgs} />
                    </div>
                    <div className="text-[11px] text-[#a8a29a] mb-4">These are searchable, they power recruiter filters.</div>
                    <div className="flex items-baseline justify-between mb-2"><label className="font-sans text-[13px] font-semibold">Leadership philosophy</label><span className="text-[11px] text-[#7d7a74]">{philosophy.length} / 280</span></div>
                    <textarea value={philosophy} maxLength={280} onChange={(e) => setPhilosophy(e.target.value)} rows={3} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                  </div>
                )}
              </div>
            </>
          )}

          {active === "Actions" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your four actions.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">The four things you most want people to do, shown as a row right under your header — e.g. <b>Contact</b> · Get in touch, <b>Listen</b> · your podcast, <b>Read</b> · your newsletter, <b>Explore</b> · your company. Each one opens Work with me, one of your pages, or a link.</p>
              <datalist id="action-types">{ACTION_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
              <div className="space-y-3 max-w-[980px]">
                {actions.map((a, i) => (
                  <div key={i} className="border border-[#E1DED7] p-[14px]">
                    <div className="grid grid-cols-[130px_1fr] gap-[10px] mb-2">
                      <input list="action-types" value={a.type} onChange={(e) => upAction(i, { type: e.target.value })} placeholder="Contact, Hire, Book…" className="font-inter text-[13px] py-[9px] px-[10px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
                      <input value={a.label} onChange={(e) => upAction(i, { label: e.target.value })} placeholder={a.type === "Contact" ? "Get in touch" : a.type === "Listen" ? "Your podcast name" : a.type === "Read" ? "Your newsletter" : "What they'll get"} className="font-inter text-[13.5px] font-semibold py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                    </div>
                    <div className="grid grid-cols-[220px_1fr_auto] gap-[10px] items-center">
                      <select value={a.dest} onChange={(e) => upAction(i, { dest: e.target.value })} className="font-inter text-[13px] py-[9px] px-[10px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink">{ACTION_DESTS.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}</select>
                      {a.dest === "link" ? <input value={a.url} onChange={(e) => upAction(i, { url: e.target.value })} placeholder="https://…" className="font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" /> : <span className="text-[12px] text-[#a8a29a]">No link needed</span>}
                      <button onClick={() => rmAction(i)} className="font-sans text-[11px] text-[#a8a29a] hover:text-[#AB0000]">Remove</button>
                    </div>
                  </div>
                ))}
                {actions.length < 4 && <button onClick={addAction} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add an action ({actions.length}/4)</button>}
              </div>
            </>
          )}

          {active === "Work With Me" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Work With Me</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Select one or more ways people can work with you. Add details for each option you select.</p>


              {/* Full-time */}
              <div className="border border-[#E1DED7] p-[18px] mb-4 max-w-[980px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] ${ftEnabled ? "bg-[#670821] text-white" : "bg-[#F4F2EF] text-[#7d7a74]"}`}>{ftEnabled ? "✓" : "+"}</span>
                    <div><div className="font-sans text-[15px] font-semibold">Full-time</div><div className="text-[12.5px] text-[#7d7a74]">Open to the right full-time role.</div></div>
                  </div>
                  <label className="flex items-center gap-[7px] text-[12.5px] font-sans cursor-pointer"><input type="checkbox" checked={ftEnabled} onChange={() => setFtEnabled(!ftEnabled)} /> Open</label>
                </div>
                {ftEnabled && <div className="mt-3"><label className="font-sans text-[12px] text-[#7d7a74] block mb-1">Role titles you're open to <span className="text-[#a8a29a]">· add one or more, searchable</span></label><input value={ftRoles} onChange={(e) => setFtRoles(e.target.value)} placeholder="VP Marketing, CMO, Head of Growth" className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" /></div>}
              </div>

              {/* Offerings grid */}
              <div className="grid grid-cols-2 gap-3 max-w-[980px]">
                {offers.map((o) => {
                  const isOpen = expanded === o.key;
                  if (isOpen) {
                    const opts = BOOKING_OPTS[o.key] || [];
                    const instant = o.booking === "book";
                    const showRate = o.key === "office" ? true : o.showRate;
                    const inp = "w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
                    const lab = "font-sans text-[12px] text-[#7d7a74] block mb-1";
                    const rateCell = o.key === "advisory" ? null : (
                      <div>
                        <div className="flex items-center justify-between mb-1"><label className="font-sans text-[12px] text-[#7d7a74]">Rate (USD)</label>{o.key !== "office" && <button onClick={() => upOffer(o.key, { showRate: !o.showRate })} className="font-sans text-[11px] text-[#670821]">{o.showRate ? "Hide, take requests" : "Set a rate"}</button>}</div>
                        {showRate ? <div className="flex items-center gap-2"><input value={o.rate} onChange={(e) => upOffer(o.key, { rate: e.target.value })} placeholder="Amount" className="flex-1 font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" /><select value={o.unit} onChange={(e) => upOffer(o.key, { unit: e.target.value })} className="w-[128px] font-inter text-[12.5px] py-[9px] px-[8px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div> : <div className="text-[12.5px] text-[#7d7a74] py-[9px]">People request, you quote later.</div>}
                      </div>
                    );
                    return (
                    <div key={o.key} className="col-span-2 border border-[#E1DED7] p-[20px] shadow-[0_4px_22px_rgba(30,26,20,0.07)]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3"><span className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] ${o.added ? "bg-[#670821] text-white" : "bg-[#F4F2EF] text-[#7d7a74]"}`}>{o.added ? "✓" : "+"}</span><div><div className="font-sans text-[15px] font-semibold">{o.title}</div><div className="text-[12.5px] text-[#7d7a74]">{o.blurb}</div></div></div>
                        <button onClick={() => setExpanded("")} className="text-[#7d7a74] text-[16px]">⌃</button>
                      </div>

                      {(o.key === "office" || o.key === "coaching") && (
                        <div className="grid grid-cols-2 gap-[14px]">
                          <div><label className={lab}>Session length</label><select value={o.length} onChange={(e) => upOffer(o.key, { length: e.target.value })} className={inp}>{["15 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes"].map((t) => <option key={t}>{t}</option>)}</select></div>
                          {rateCell}
                        </div>
                      )}
                      {(o.key === "office" || o.key === "coaching") && instant && (() => {
                        const baseMin = parseMinutes(o.length), baseRate = parsePriceCents(o.rate) / 100, extra = o.extra || [];
                        return (
                          <div className="mt-[14px]">
                            <label className={lab}>Also offer other lengths <span className="text-[#a8a29a]">· priced from your {baseMin}-minute rate, and you can change any of them</span></label>
                            <div className="flex flex-wrap gap-[6px]">
                              {SESSION_LENGTHS.filter((m) => m !== baseMin).map((m) => { const on = extra.some((x) => x.min === m); return (
                                <button key={m} aria-pressed={on} onClick={() => upOffer(o.key, { extra: on ? extra.filter((x) => x.min !== m) : [...extra, { min: m, price: String(proRataDollars(baseRate, baseMin, m) || "") }].sort((a, b) => a.min - b.min) })} className={`font-sans text-[12.5px] py-[6px] px-[11px] border ${on ? "border-brand-ink bg-[#F1EEE8]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-[#a8a29a]"}`}>{m} min{!on && baseRate > 0 ? ` · $${proRataDollars(baseRate, baseMin, m)}` : ""}</button>
                              ); })}
                            </div>
                            {extra.length > 0 && (
                              <div className="mt-[10px] space-y-[6px]">
                                {extra.map((x) => (
                                  <div key={x.min} className="flex items-center gap-[10px]">
                                    <span className="font-sans text-[13px] w-[64px]">{x.min} min</span>
                                    <span className="text-[13px] text-[#7d7a74]">$</span>
                                    <input aria-label={`Price for ${x.min} minutes`} inputMode="decimal" value={x.price} onChange={(e) => upOffer(o.key, { extra: extra.map((y) => (y.min === x.min ? { ...y, price: e.target.value.replace(/[^0-9.]/g, "") } : y)) })} className="w-[96px] font-inter text-[13.5px] py-[7px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                                    {baseRate > 0 && Number(x.price) !== proRataDollars(baseRate, baseMin, x.min) && <button onClick={() => upOffer(o.key, { extra: extra.map((y) => (y.min === x.min ? { ...y, price: String(proRataDollars(baseRate, baseMin, x.min)) } : y)) })} className="font-sans text-[11.5px] text-[#7d7a74] underline underline-offset-2 hover:text-brand-ink">Use ${proRataDollars(baseRate, baseMin, x.min)}</button>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
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
                        <div className="grid grid-cols-2 gap-[14px]">
                          <div><label className={lab}>Type</label><select value={o.kind} onChange={(e) => upOffer(o.key, { kind: e.target.value })} className={inp}>{["Event", "Podcast", "Workshop"].map((t) => <option key={t}>{t}</option>)}</select></div>
                          {rateCell}
                        </div>
                      )}
                      {o.key === "advisory" && (
                        <>
                          <div className="grid grid-cols-2 gap-[14px]">
                            <div><label className={lab}>Availability</label><input value={o.cadence} onChange={(e) => upOffer(o.key, { cadence: e.target.value })} placeholder="e.g. 1 per quarter" className={inp} /></div>
                            <div><label className={lab}>Industries</label><input value={o.industries || ""} onChange={(e) => upOffer(o.key, { industries: e.target.value })} placeholder="Fintech, SaaS, Consumer…" className={inp} /></div>
                          </div>
                          <div className="mt-[14px]"><label className={lab}>Company stage <span className="text-[#a8a29a]">· select any</span></label>
                            <div className="flex flex-wrap gap-[8px]">
                              {STAGES.map((s) => { const sel = (o.stage || "").split(", ").filter(Boolean); const on = sel.includes(s); return <button key={s} onClick={() => upOffer(o.key, { stage: (on ? sel.filter((x) => x !== s) : [...sel, s]).join(", ") })} className={`font-sans text-[12.5px] py-[7px] px-[13px] border-[1.5px] ${on ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#3a352f]"}`}>{s}</button>; })}
                            </div>
                          </div>
                        </>
                      )}
                      {o.key === "content" && (
                        <div className="text-[12.5px] text-[#3a352f] bg-[#F4F2EF] p-[12px]">This opens your <b>media kit</b>, a rate card with your platforms, audience, deliverables and prices. <button onClick={() => setActive("Reach")} className="text-[#670821] font-medium cursor-pointer">Build media kit →</button></div>
                      )}

                      <div className="mt-[14px]">
                        <label className={lab}>{KEYWORD_LABEL[o.key]} <span className="text-[#a8a29a]">· searchable tags, help people find you</span></label>
                        <div className="flex flex-wrap gap-[6px] items-center border border-[#E1DED7] py-[7px] px-[9px] bg-white">
                          {offerTags(o.keywords).map((t) => <span key={t} className="inline-flex items-center gap-1 font-sans text-[12px] py-[4px] px-[9px] bg-[#EDE7FF] text-[#670821]">{t}<button onClick={() => rmOfferTag(o.key, o.keywords, t)} className="text-[#670821]/60 hover:text-[#670821]">×</button></span>)}
                          <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === ",") && tagDraft.trim()) { e.preventDefault(); addOfferTag(o.key, o.keywords, tagDraft); } }} placeholder={offerTags(o.keywords).length ? "add another…" : "Type a tag, press Enter"} className="flex-1 min-w-[130px] font-inter text-[12.5px] py-[4px] px-[6px] focus:outline-none" />
                        </div>
                      </div>

                      <div className="mt-[14px]"><label className={lab}>Description (optional)</label><textarea value={o.desc} onChange={(e) => upOffer(o.key, { desc: e.target.value })} rows={2} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" /></div>

                      <div className="mt-[16px] pt-[14px] border-t border-[#ECEAE4]"><label className={lab}>How they reach you</label><select value={o.booking} onChange={(e) => upOffer(o.key, { booking: e.target.value })} className="max-w-[240px] font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink">{opts.map((op) => <option key={op.v} value={op.v}>{op.label}</option>)}</select></div>
                      {instant && <div className="mt-[12px] text-[12px] text-[#3a352f] bg-[#F1EEE8] p-[11px]">People pick from the dates and times you set under <b>Booking times</b>, below your offers. Set a length and a price here. If you have no open times, this offer uses Send request.</div>}
                      <div className="flex items-center justify-between mt-4">
                        <button onClick={() => upOffer(o.key, { added: !o.added })} className="flex items-center gap-2 font-sans text-[12.5px] font-medium text-brand-ink">
                          <span className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center text-[11px] ${o.added ? "bg-[#670821] border-[#670821] text-white" : "border-[#C7C2B8] text-transparent"}`}>✓</span>
                          {o.added ? "Showing on your profile" : "Show on my profile"}
                        </button>
                        <button onClick={() => setExpanded("")} className="font-sans border border-[#E1DED7] text-brand-ink text-[12.5px] font-medium py-[8px] px-[16px] hover:border-brand-ink">Done</button>
                      </div>
                    </div>
                    );
                  }
                  return (
                    <div key={o.key} onClick={() => setExpanded(o.key)} className="border border-[#E1DED7] p-[16px] flex items-center gap-3 cursor-pointer hover:border-[#3a352f]">
                      <span onClick={(e) => { e.stopPropagation(); upOffer(o.key, { added: !o.added }); }} title={o.added ? "Showing on your profile — click to hide" : "Show on my profile"} className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] cursor-pointer ${o.added ? "bg-[#670821] text-white" : "bg-[#F4F2EF] text-[#7d7a74]"}`}>{o.added ? "✓" : "+"}</span>
                      <div className="flex-1"><div className="font-sans text-[14px] font-semibold">{o.title}</div><div className="text-[12px] text-[#7d7a74]">{o.blurb}</div></div>
                      <span className="text-[#7d7a74] text-[15px]">{o.added ? "⌄" : "›"}</span>
                    </div>
                  );
                })}
              </div>

              {/* Booking times sit under the offers, and only matter for offers set to "Book instantly" */}
              <div className="mt-6"><BookingSetup username={pubUsername || ""} forOffers={offers.filter((o) => o.added && o.booking === "book").map((o) => o.title)} /></div>

              <div className="mt-6 flex items-center gap-2 text-[12.5px] text-[#7d7a74] max-w-[980px]">🔒 You control what's visible. You can hide or edit any offering at any time.</div>
            </>
          )}

          {active === "Impact" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your impact.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[54ch] leading-[1.5] mb-7">Add up to 4 career highlights. Not job duties, the moments something measurably changed because you were there.</p>
              <div className="space-y-4 max-w-[980px]">
                {impacts.map((im, i) => (
                  <div key={i} className="border border-[#E1DED7] p-[18px]">
                    <div className="flex justify-between items-center mb-3"><span className="font-sans text-[12px] font-semibold text-[#7d7a74]">Highlight {i + 1}</span><button onClick={() => rmImpact(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button></div>
                    <input value={im.headline} onChange={(e) => upImpact(i, { headline: e.target.value })} placeholder="Headline, e.g. Scaled pipeline 3× in 9 months" className="w-full font-sans font-semibold text-[15px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <input value={im.context} onChange={(e) => upImpact(i, { context: e.target.value })} placeholder="Company / context, e.g. Meridian · 2024" className="w-full font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <textarea value={im.story} onChange={(e) => upImpact(i, { story: e.target.value })} rows={2} placeholder="What you did, what changed, why it mattered." className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                  </div>
                ))}
                {impacts.length < 4 && <button onClick={addImpact} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a highlight</button>}
              </div>
            </>
          )}

          {active === "Skills" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your skills.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">Your skills, how deep they run, and what you&apos;re growing into. Star up to 5 to lead your profile, then slide to set how deep each one runs. We sort them into categories for you.</p>

              <div className="mb-8 max-w-[680px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && skillQuery.trim()) { e.preventDefault(); addSkill(skillQuery); } }} placeholder="Search to add a skill…" className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                    {skillQuery.trim().length >= 1 && (() => {
                      const q = skillQuery.trim().toLowerCase();
                      const matches = SKILLS_LIBRARY.filter((s) => s.name.toLowerCase().includes(q) && !skills.some((k) => k.name.toLowerCase() === s.name.toLowerCase())).slice(0, 8);
                      const exists = SKILLS_LIBRARY.some((s) => s.name.toLowerCase() === q) || skills.some((k) => k.name.toLowerCase() === q);
                      return (
                        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-[#E1DED7] shadow-[0_8px_24px_rgba(30,26,20,0.1)] max-h-[280px] overflow-y-auto">
                          {matches.map((s) => (
                            <button key={s.name} onClick={() => addSkill(s.name)} className="w-full text-left font-inter text-[13px] py-[8px] px-[11px] hover:bg-[#EDE7FF] flex items-center justify-between gap-3">
                              <span>{s.name}</span><span className="text-[10.5px] text-[#a8a29a] shrink-0">{s.category}</span>
                            </button>
                          ))}
                          {!exists && <button onClick={() => addSkill(skillQuery)} className="w-full text-left font-inter text-[13px] py-[8px] px-[11px] hover:bg-[#EDE7FF] text-[#670821] font-medium">+ Add &ldquo;{skillQuery.trim()}&rdquo;</button>}
                          {matches.length === 0 && exists && <div className="font-inter text-[12.5px] py-[8px] px-[11px] text-[#a8a29a]">Already in your list.</div>}
                        </div>
                      );
                    })()}
                  </div>
                  <span className="text-[11px] text-[#7d7a74] shrink-0 whitespace-nowrap">★ {topCount}/5 top · {skills.length} skills</span>
                </div>
                <div className="space-y-5">
                  {LIB_CATS.map((cat) => {
                    const rows = skills.map((s, i) => ({ s, i })).filter((x) => catOf(x.s.name) === cat);
                    if (!rows.length) return null;
                    return (
                      <div key={cat}>
                        <div className="font-sans text-[11px] font-semibold text-[#7d7a74] uppercase tracking-[0.08em] mb-2">{cat} <span className="font-normal text-[#a8a29a] normal-case tracking-normal">· {rows.length}</span></div>
                        <div className="space-y-2">
                          {rows.map(({ s, i }) => (
                            <div key={i} className="flex items-center gap-3 border border-[#E1DED7] py-[7px] px-[10px]">
                              <button onClick={() => toggleTop(i)} title="Feature in top 5" className={`text-[16px] leading-none shrink-0 ${s.top ? "text-[#670821]" : "text-[#d8d4cc] hover:text-[#670821]"}`}>★</button>
                              <input value={s.name} onChange={(e) => upSkillField(i, { name: e.target.value })} className="flex-1 min-w-0 font-inter text-[13.5px] py-[4px] focus:outline-none" />
                              <div className="w-[150px] shrink-0">
                                <input type="range" min={1} max={4} step={1} value={SKILL_LEVELS.indexOf(s.level) + 1} onChange={(e) => upSkillField(i, { level: SKILL_LEVELS[+e.target.value - 1] })} className="w-full accent-[#670821] cursor-pointer" />
                                <div className="font-sans text-[10px] text-[#7d7a74] text-right -mt-[2px]">{s.level}</div>
                              </div>
                              <button onClick={() => rmSkill(i)} className="text-[#7d7a74] hover:text-[#AB0000] text-[15px] shrink-0">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 max-w-[760px]">
                <label className="font-sans text-[13px] font-semibold block mb-1">Currently learning <span className="font-normal text-[#a8a29a]">· the top skills you&apos;re building right now</span></label>
                <div className="flex flex-wrap gap-[6px] items-center border border-[#E1DED7] py-[7px] px-[9px]">
                  {learning.map((k) => <span key={k} className="inline-flex items-center gap-1 font-sans text-[12px] py-[4px] px-[9px] bg-[#EDE7FF] text-[#670821]">{k}<button onClick={() => rmLearn(k)} className="text-[#670821]/60 hover:text-[#670821]">×</button></span>)}
                  <input value={learnDraft} onChange={(e) => setLearnDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearn())} placeholder="add a skill…" className="flex-1 min-w-[100px] font-inter text-[12.5px] py-[4px] px-[6px] focus:outline-none" />
                </div>
              </div>

              <div className="max-w-[680px]">
                <div className="flex items-baseline justify-between mb-2">
                  <label className="font-sans text-[13px] font-semibold">Industries <span className="font-normal text-[#a8a29a]">· where you&apos;ve worked · powers search</span></label>
                  <span className="text-[11px] text-[#7d7a74]">{industries.length}/{IND_MAX}</span>
                </div>
                <div className="flex flex-wrap gap-[8px] mb-3">
                  {SKILL_INDUSTRIES.map((t) => { const on = industries.includes(t); const full = !on && industries.length >= IND_MAX; return <button key={t} disabled={full} onClick={() => toggleIndustry(t)} className={`font-sans text-[13px] py-[7px] px-[13px] border ${on ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : full ? "border-[#ECEAE4] bg-white text-[#c4bfb6] cursor-not-allowed" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-brand-ink"}`}>{t}</button>; })}
                  {industries.filter((t) => !SKILL_INDUSTRIES.includes(t)).map((t) => <span key={t} className="inline-flex items-center gap-1 font-sans text-[13px] py-[7px] px-[13px] border border-[#670821] bg-[#EDE7FF] text-[#670821]">{t}<button onClick={() => toggleIndustry(t)} className="text-[#670821]/60 hover:text-[#670821]">×</button></span>)}
                </div>
                {industries.length < IND_MAX && (
                  <input value={indDraft} onChange={(e) => setIndDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIndustry())} placeholder="Add your own industry…" className="max-w-[280px] w-full font-inter text-[12.5px] py-[8px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                )}
              </div>
            </>
          )}

          {active === "Superpowers" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your superpowers.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-6">The things you&apos;re uniquely great at — in your own words. Write it like you&apos;d say it out loud. Your profile showcases your top {SP_SHOWCASE}; the rest live in your bio. We pull the keywords that make you findable.</p>
              <div className="space-y-4 max-w-[980px]">
                {powers.map((p, i) => (
                  <div key={i} className={`p-[18px] border ${i < SP_SHOWCASE ? "border-[#E1DED7]" : "border-dashed border-[#DBD7CF] bg-[#FFFFFF]"}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-sans text-[12px] font-semibold text-[#670821]">Superpower {String(i + 1).padStart(2, "0")}{i < SP_SHOWCASE ? "" : <span className="text-[#a8a29a] font-medium"> · shows in bio</span>}</span>
                      <button onClick={() => rmPower(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button>
                    </div>
                    <textarea value={p.statement} onChange={(e) => upPower(i, { statement: e.target.value })} rows={2} placeholder="e.g. I spot unique white space for startups and build scalable business models that drive revenue." className="w-full font-sans font-semibold text-[15px] leading-snug py-[9px] px-[11px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                    <textarea value={p.proof} onChange={(e) => upPower(i, { proof: e.target.value })} rows={2} placeholder="Short description (optional) — what this looks like in practice. Mention companies or keywords if you like." className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] mt-2 resize-none focus:outline-none focus:border-brand-ink" />
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-[11.5px] font-semibold text-[#7d7a74]">Search keywords <span className="font-normal text-[#a8a29a]">· helps people find you · never shown on your profile</span></span>
                        <button onClick={() => suggestKw(i)} className="font-sans text-[11px] text-[#670821] hover:underline">↻ Suggest from text</button>
                      </div>
                      <div className="flex flex-wrap gap-[6px] items-center">
                        {p.keywords.map((k) => <span key={k} className="inline-flex items-center gap-1 font-sans text-[12px] py-[4px] px-[9px] bg-[#EDE7FF] text-[#670821]">{k}<button onClick={() => rmKw(i, k)} className="text-[#670821]/50 hover:text-[#670821]">×</button></span>)}
                        <input value={kwDraft[i] || ""} onChange={(e) => setKwDraft((d) => ({ ...d, [i]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKw(i))} placeholder="add…" className="font-inter text-[12px] py-[4px] px-[8px] border border-[#E1DED7] w-[80px] focus:outline-none focus:border-brand-ink" />
                      </div>
                    </div>
                  </div>
                ))}
                {powers.length < SP_MAX && <button onClick={addPower} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a superpower <span className="text-[#a8a29a]">({powers.length}/{SP_MAX})</span></button>}
              </div>
            </>
          )}

          {active === "Values" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your values.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">The values that guide how you work. Choose up to 12, then feature the 4 that matter most — they lead your profile; the rest live in your bio.</p>

              <div className="mb-8 max-w-[980px]">
                <div className="flex items-baseline justify-between mb-2">
                  <label className="font-sans text-[13px] font-semibold">Your values</label>
                  <span className="text-[11px] text-[#7d7a74]">{vals.length}/{VAL_MAX}</span>
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {VALUES.map((v) => { const on = vals.includes(v); const full = !on && vals.length >= VAL_MAX; return <button key={v} disabled={full} onClick={() => toggleVal(v)} className={`font-sans text-[13px] py-[7px] px-[13px] border transition-colors ${on ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : full ? "border-[#ECEAE4] bg-white text-[#c4bfb6] cursor-not-allowed" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-brand-ink"}`}>{v}</button>; })}
                </div>
              </div>

              {vals.length > 0 && (
                <div className="max-w-[980px]">
                  <div className="flex items-baseline justify-between mb-2">
                    <label className="font-sans text-[13px] font-semibold">Core Values <span className="font-normal text-[#a8a29a]">· star up to {VAL_FEATURED}. These show on your home page.</span></label>
                    <span className="text-[11px] text-[#7d7a74]">★ {vFeatured.length}/{VAL_FEATURED}</span>
                  </div>
                  <div className="flex flex-wrap gap-[8px]">
                    {vals.map((v) => { const on = vFeatured.includes(v); const full = !on && vFeatured.length >= VAL_FEATURED; return <button key={v} disabled={full} onClick={() => toggleVFeatured(v)} className={`font-sans text-[13px] py-[7px] px-[13px] border transition-colors ${on ? "border-[#670821] bg-[#670821] text-white" : full ? "border-[#ECEAE4] bg-white text-[#c4bfb6] cursor-not-allowed" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-brand-ink"}`}>{on ? "★ " : ""}{v}</button>; })}
                  </div>
                </div>
              )}
            </>
          )}

          {active === "Media" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your media.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">Press, talks, writing, podcasts, portfolio — the work that shows what you do. Star up to {MEDIA_FEATURED} to feature in your gallery; the rest live in your bio.</p>
              <SiteScan website={socials.website} have={media.map((m) => m.url).filter(Boolean)}
                emptySocials={(["linkedin", "instagram", "x", "tiktok", "youtube", "substack"] as const).filter((k) => !socials[k].trim())}
                onAdd={(items) => setMedia((m) => [...m.filter((x) => x.title.trim() || x.url.trim()), ...items])}
                onSocials={(found) => setSocials((c) => ({ ...c, ...found }))} />
              <div className="space-y-4 max-w-[980px]">
                {media.map((m, i) => (
                  <div key={i} className={`p-[16px] border ${m.featured ? "border-[#E1DED7]" : "border-dashed border-[#DBD7CF] bg-[#FFFFFF]"}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap gap-[6px]">
                        {MEDIA_KINDS.map((k) => <button key={k} onClick={() => upMedia(i, { kind: k })} className={`font-sans text-[11.5px] py-[4px] px-[10px] border ${m.kind === k ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#7d7a74] hover:border-brand-ink"}`}>{k}</button>)}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleMediaFeatured(i)} className={`font-sans text-[11.5px] font-medium py-[4px] px-[10px] border ${m.featured ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] text-[#7d7a74] hover:border-brand-ink hover:text-brand-ink"}`}>{m.featured ? "★ Featured" : "☆ Feature"}</button>
                        <span className="w-px h-[16px] bg-[#E1DED7] mx-1" />
                        <button onClick={() => rmMedia(i)} className="font-sans text-[11px] text-[#a8a29a] hover:text-[#AB0000]">Remove</button>
                      </div>
                    </div>
                    <input value={m.title} onChange={(e) => upMedia(i, { title: e.target.value })} placeholder="Title, e.g. The operators rebuilding personal branding" className="w-full font-sans font-semibold text-[14.5px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <div className="flex gap-2 mb-2">
                      <input value={m.outlet} onChange={(e) => upMedia(i, { outlet: e.target.value })} placeholder="Source / outlet" className="flex-1 min-w-0 font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <input value={m.url} onChange={(e) => upMedia(i, { url: e.target.value })} placeholder="Link (optional)" className="flex-1 min-w-0 font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                    </div>
                    <label className="w-full font-sans text-[12px] text-[#7d7a74] py-[10px] border border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink flex items-center justify-center cursor-pointer">
                      {m.img ? "Replace cover image" : "+ Upload cover image (optional)"}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadImg(f, `media-${i}`); if (url) upMedia(i, { img: url }); } e.currentTarget.value = ""; }} />
                    </label>
                    {m.img && <div className="mt-2 flex items-center gap-2"><img src={m.img} alt="" className="w-[72px] h-[46px] object-cover border border-[#E1DED7]" /><button onClick={() => upMedia(i, { img: "" })} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove cover</button></div>}
                  </div>
                ))}
                <button onClick={addMedia} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add media</button>
              </div>
            </>
          )}

          {active === "Testimonials" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Testimonials.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-6">Words from people you&apos;ve worked with, or a quote of your own. Star up to 2 to feature on your profile; the rest live in your bio. For your own words, choose &ldquo;Me&rdquo; and it shows as a Quote.</p>
              <div className="space-y-4 max-w-[980px]">
                {testis.map((t, i) => (
                  <div key={i} className={`p-[18px] border ${t.featured ? "border-[#E1DED7]" : "border-dashed border-[#DBD7CF] bg-[#FFFFFF]"}`}>
                    <div className="flex justify-between items-center mb-3">
                      <button onClick={() => toggleTestiFeatured(i)} className={`flex items-center gap-1.5 font-sans text-[12px] font-semibold ${t.featured ? "text-[#670821]" : "text-[#a8a29a] hover:text-[#670821]"}`}><span className="text-[15px] leading-none">★</span>{t.featured ? "Featured" : "Feature"}</button>
                      <button onClick={() => rmTesti(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button>
                    </div>
                    <textarea value={t.quote} onChange={(e) => upTesti(i, { quote: e.target.value })} rows={2} placeholder={t.relationship === "Me" ? "Something you believe, in your own words." : "What they said about working with you."} className="w-full font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 resize-none focus:outline-none focus:border-brand-ink" />
                    <div className="flex gap-2">
                      <input value={t.relationship === "Me" ? name : t.author} readOnly={t.relationship === "Me"} onChange={(e) => upTesti(i, { author: e.target.value })} placeholder="Name" className="flex-1 min-w-0 font-inter text-[13px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <input value={t.role} onChange={(e) => upTesti(i, { role: e.target.value })} placeholder={t.relationship === "Me" ? "Optional, e.g. Founder, Marquee" : "Role, Company"} className="flex-1 min-w-0 font-inter text-[13px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <select value={t.relationship} onChange={(e) => upTesti(i, { relationship: e.target.value })} className="shrink-0 font-sans text-[12px] py-[8px] px-[7px] border border-[#E1DED7] bg-white focus:outline-none">
                        {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                <button onClick={addTesti} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a testimonial</button>
              </div>
            </>
          )}

          {active === "Education" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Education.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">Schools, degrees, and the certifications that back up your expertise.</p>
              <div className="space-y-3 max-w-[980px]">
                {edu.map((e, i) => (
                  <div key={i} className="p-[16px] border border-[#E1DED7]">
                    <div className="flex justify-between items-center mb-2"><span className="font-sans text-[12px] font-semibold text-[#7d7a74]">Education {i + 1}</span><button onClick={() => rmEdu(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button></div>
                    <input value={e.school} onChange={(ev) => upEdu(i, { school: ev.target.value })} placeholder="School / institution" className="w-full font-sans font-semibold text-[14px] py-[8px] px-[10px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <div className="flex gap-2">
                      <input value={e.degree} onChange={(ev) => upEdu(i, { degree: ev.target.value })} placeholder="Degree" className="w-[110px] shrink-0 font-inter text-[13px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <input value={e.field} onChange={(ev) => upEdu(i, { field: ev.target.value })} placeholder="Field of study" className="flex-1 min-w-0 font-inter text-[13px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <input value={e.year} onChange={(ev) => upEdu(i, { year: ev.target.value.replace(/[^0-9]/g, "") })} placeholder="Year" inputMode="numeric" className="w-[74px] shrink-0 font-inter text-[13px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add education</button>
              </div>
              <div className="mt-6 max-w-[980px]">
                <label className="font-sans text-[13px] font-semibold block mb-2">Certifications <span className="font-normal text-[#a8a29a]">· add one at a time</span></label>
                <div className="space-y-2">
                  {certs.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={c} onChange={(ev) => upCert(i, ev.target.value)} placeholder="e.g. Google Analytics IQ" className="flex-1 min-w-0 font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                      <button onClick={() => rmCert(i)} aria-label="Remove certification" className="shrink-0 w-[38px] font-sans text-[15px] text-[#a8a29a] border border-[#E1DED7] hover:border-[#AB0000] hover:text-[#AB0000]">×</button>
                    </div>
                  ))}
                </div>
                <button onClick={addCert} className="mt-2 font-sans text-[13px] text-[#670821] font-medium hover:underline">+ Add certification</button>
              </div>
            </>
          )}

          {active === "Reach" && (() => {
            const ri = "w-full font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink";
            return (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your reach.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">For creators &amp; public figures — your audience across platforms. This powers your media kit. Leave it empty and it won&apos;t show on your profile.</p>

              <div className="mb-6 max-w-[980px]">
                <label className="font-sans text-[13px] font-semibold block mb-2">Platforms <span className="font-normal text-[#a8a29a]">· pick the ones you&apos;re on</span></label>
                <div className="flex flex-wrap gap-[8px]">
                  {REACH_PLATFORMS.map((p) => { const on = reach.some((x) => x.key === p); return <button key={p} onClick={() => (on ? rmReach(p) : addReach(p))} className={`font-sans text-[13px] py-[7px] px-[13px] border ${on ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#3a352f] hover:border-brand-ink"}`}>{on ? "✓ " : "+ "}{p}</button>; })}
                </div>
              </div>

              {reach.length > 0 && (
                <div className="space-y-3 max-w-[980px] mb-8">
                  {reach.map((p) => (
                    <div key={p.key} className="border border-[#E1DED7] p-[14px]">
                      <div className="flex items-center justify-between mb-2"><span className="font-sans text-[14px] font-semibold">{p.key}</span><button onClick={() => rmReach(p.key)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button></div>
                      <div className="grid grid-cols-2 gap-[10px]">
                        <input value={p.handle} onChange={(e) => upReach(p.key, { handle: e.target.value })} placeholder="@handle" className={ri} />
                        <input value={p.followers} onChange={(e) => upReach(p.key, { followers: e.target.value })} placeholder="Followers (e.g. 128K)" className={ri} />
                        <input value={p.engagement} onChange={(e) => upReach(p.key, { engagement: e.target.value })} placeholder="Engagement rate (e.g. 4.2%)" className={ri} />
                        <input value={p.url} onChange={(e) => upReach(p.key, { url: e.target.value })} placeholder="Profile link (optional)" className={ri} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="max-w-[980px]">
                <label className="font-sans text-[13px] font-semibold block mb-2">Audience demographics <span className="font-normal text-[#a8a29a]">· optional, great for brand deals</span></label>
                <div className="grid grid-cols-3 gap-[10px]">
                  <input value={audAge} onChange={(e) => setAudAge(e.target.value)} placeholder="Top age (e.g. 25–40)" className={ri} />
                  <input value={audGender} onChange={(e) => setAudGender(e.target.value)} placeholder="Gender (e.g. 72% women)" className={ri} />
                  <input value={audGeo} onChange={(e) => setAudGeo(e.target.value)} placeholder="Top geos (e.g. US, UK, CA)" className={ri} />
                </div>
              </div>
            </>
            );
          })()}

          {active === "Shop" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your shop.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">Productize your expertise — templates, guides, courses, downloads. Each one links out to where people buy it. They show on the Shop page of your profile.</p>
              <div className="space-y-4 max-w-[980px]">
                {products.map((p, i) => (
                  <div key={i} className={`p-[18px] border ${p.featured ? "border-[#E1DED7]" : "border-dashed border-[#DBD7CF] bg-[#FFFFFF]"}`}>
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex flex-wrap gap-[6px]">
                        {STORE_KINDS.map((k) => <button key={k} onClick={() => upProduct(i, { kind: k })} className={`font-sans text-[11.5px] py-[4px] px-[10px] border ${p.kind === k ? "border-[#670821] bg-[#EDE7FF] text-[#670821]" : "border-[#E1DED7] bg-white text-[#7d7a74] hover:border-brand-ink"}`}>{k}</button>)}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleProductFeatured(i)} title="Feature" className={`text-[16px] leading-none ${p.featured ? "text-[#670821]" : "text-[#d8d4cc] hover:text-[#670821]"}`}>★</button>
                        <button onClick={() => rmProduct(i)} className="font-sans text-[11px] text-[#7d7a74] hover:text-[#AB0000]">Remove</button>
                      </div>
                    </div>
                    <input value={p.title} onChange={(e) => upProduct(i, { title: e.target.value })} placeholder="Title, e.g. The GTM Launch Kit" className="w-full font-sans font-semibold text-[14.5px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <input value={p.blurb} onChange={(e) => upProduct(i, { blurb: e.target.value })} placeholder="One line on what it is" className="w-full font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] mb-2 focus:outline-none focus:border-brand-ink" />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-sans text-[14px] text-[#7d7a74]">$</span>
                      <input value={p.price} onChange={(e) => upProduct(i, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="0 = free" inputMode="numeric" className="w-[110px] font-sans text-[14px] py-[8px] px-[10px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                    </div>
                    <input value={p.url || ""} onChange={(e) => upProduct(i, { url: e.target.value })} placeholder="Link — where people buy it (Amazon, Gumroad, your site…)" className="w-full font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
                  </div>
                ))}
                <button onClick={addProduct} className="w-full font-sans text-[13px] text-[#7d7a74] py-4 border-2 border-dashed border-[#E1DED7] hover:border-brand-ink hover:text-brand-ink">+ Add a product</button>
              </div>
            </>
          )}

          {active === "Long Bio" && (
            <>
              <h1 className="font-lora text-[34px] font-normal tracking-[-0.01em] leading-[1.05] mb-[10px]">Your long bio.</h1>
              <p className="text-[15px] text-[#3a352f] max-w-[72ch] leading-[1.5] mb-7">The full narrative, in your own words. This is also where the &ldquo;see all&rdquo; overflow from Superpowers, Values, and Media lives.</p>
              <div className="max-w-[980px]">
                <textarea value={longBio} onChange={(e) => setLongBio(e.target.value)} rows={12} className="w-full font-inter text-[14.5px] leading-[1.6] py-[14px] px-[16px] border border-[#E1DED7] resize-none focus:outline-none focus:border-brand-ink" />
                <div className="flex justify-between text-[11px] text-[#a8a29a] mt-1"><span>Write like you talk — a few short paragraphs beats one long one.</span><span>{longBio.length} chars</span></div>
              </div>
            </>
          )}

          {!BUILT.has(active) && (
            <div className="mt-10 text-[14px] text-[#7d7a74]">"{active}" is next in the step-by-step build. Building it once you've signed off on this step.</div>
          )}
          <div className="flex items-center justify-between mt-14 pt-6 border-t border-[#ECEAE4] max-w-[980px]">
            <button onClick={() => { const i = ALL_STEPS.indexOf(active); if (i > 0) setActive(ALL_STEPS[i - 1]); window.scrollTo(0, 0); }} disabled={ALL_STEPS.indexOf(active) <= 0} className="font-sans text-[13px] text-[#7d7a74] hover:text-brand-ink disabled:opacity-30 disabled:cursor-default">← Back</button>
            {ALL_STEPS.indexOf(active) < ALL_STEPS.length - 1
              ? <button onClick={() => { const i = ALL_STEPS.indexOf(active); setActive(ALL_STEPS[i + 1]); window.scrollTo(0, 0); }} className="font-sans bg-brand-ink text-white text-[13px] font-medium py-[11px] px-6">Next →</button>
              : <button onClick={() => setShowPublish(true)} className="font-sans bg-[#670821] text-white text-[13px] font-medium py-[11px] px-6">{claimed ? "Update my profile →" : "Publish my profile →"}</button>}
          </div>
        </main>
      </div>


      {/* ── ONBOARDING GUIDE (rides on top of the dashboard) ── */}
      {tour === "welcome" && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-[440px] w-full p-8 text-center">
            <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-3">Welcome</div>
            <h2 className="font-sans text-[26px] font-semibold tracking-[-0.01em] mb-2 leading-[1.1]">Let’s build your Marquee.</h2>
            <p className="text-[14px] text-[#57524c] leading-[1.55] mb-6">We’ll walk through it together — your profile first, then your brand. Everything stays editable, and you can skip anything and come back.</p>
            <button onClick={startTour} className="w-full font-sans bg-[#670821] text-white text-[14px] font-semibold py-[13px] mb-2 hover:bg-[#4E0619]">Start building →</button>
            <button onClick={() => setTour(null)} className="w-full font-sans text-[13px] text-[#7d7a74] py-2 hover:text-brand-ink">I’ll explore on my own</button>
          </div>
        </div>
      )}

      {typeof tour === "number" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] w-[min(560px,92vw)] bg-white border border-[#E1DED7] shadow-[0_18px_44px_rgba(20,10,60,0.18)] p-[18px_20px]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#670821]">{tourGroup(tour)} · {tour + 1} of 13</div>
              <div className="font-sans text-[15px] font-semibold mt-0.5">{TOUR_STEPS[tour]}</div>
              <div className="text-[12.5px] text-[#7d7a74] mt-0.5 leading-snug">{TOUR_HINTS[TOUR_STEPS[tour]]}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {tour > 0 && <button onClick={() => tourGo(tour - 1)} className="font-sans text-[13px] text-[#7d7a74] px-3 py-2 hover:text-brand-ink">Back</button>}
              <button onClick={() => tourGo(tour + 1)} className="font-sans bg-[#670821] text-white text-[13px] font-semibold px-5 py-[10px] hover:bg-[#4E0619]">{tour === TOUR_STEPS.length - 1 ? "Finish →" : "Next →"}</button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="h-[5px] bg-[#ECEAE4] flex-1"><div className="h-full bg-[#670821] transition-all" style={{ width: `${((tour + 1) / 13) * 100}%` }} /></div>
            <button onClick={() => setTour(null)} className="font-sans text-[12px] text-[#a8a29a] hover:text-[#7d7a74] shrink-0">Skip tour</button>
          </div>
        </div>
      )}

      {tour === "done" && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-[440px] w-full p-8 text-center">
            <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-3">That’s your Marquee</div>
            <h2 className="font-sans text-[26px] font-semibold tracking-[-0.01em] mb-2 leading-[1.1]">Looking good.</h2>
            <p className="text-[14px] text-[#57524c] leading-[1.55] mb-6">Edit any section from the left rail anytime. Ready to publish your profile?</p>
            <button onClick={() => { setTour(null); setShowPublish(true); }} className="w-full font-sans bg-brand-ink text-white text-[14px] font-semibold py-[13px] mb-2 hover:bg-black">Generate my profile →</button>
            <button onClick={() => setTour(null)} className="w-full font-sans text-[13px] text-[#7d7a74] py-2 hover:text-brand-ink">Keep editing</button>
          </div>
        </div>
      )}

      {showPublish && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-[440px] w-full p-8">
            {pubResult?.ok ? (
              <div className="text-center">
                <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-3">{claimed ? "Updated" : "Published"}</div>
                <h2 className="font-lora text-[27px] mb-2 leading-[1.1]">You&apos;re live.</h2>
                <a href={`/${pubResult.msg}`} target="_blank" rel="noopener" className="block font-sans text-[15px] font-semibold text-[#670821] mb-6 hover:underline">marquee.bio/{pubResult.msg} ↗</a>
                <button onClick={() => { setShowPublish(false); window.location.href = `/${pubResult.msg}`; }} className="w-full font-sans bg-brand-ink text-white text-[14px] font-semibold py-[13px]">See my profile →</button>
                <button onClick={() => setShowPublish(false)} className="w-full font-sans text-[13px] text-[#7d7a74] py-2 mt-1 hover:text-brand-ink">Keep editing</button>
              </div>
            ) : claimed ? (
              <>
                <h2 className="font-lora text-[27px] mb-2 leading-[1.1]">Publish your updates</h2>
                <p className="text-[14px] text-[#57524c] leading-[1.55] mb-4">Your changes will go live at your profile — same link as always.</p>
                <div className="font-sans text-[15px] font-semibold text-[#670821] mb-5">marquee.bio/{pubUsername}</div>
                {pubResult && !pubResult.ok && <div className="text-[13px] text-[#AB0000] mb-3">{pubResult.msg}</div>}
                <button onClick={publish} disabled={publishing} className="w-full font-sans bg-brand-ink text-white text-[14px] font-semibold py-[13px] mb-2 disabled:opacity-40">{publishing ? "Publishing…" : "Update my profile →"}</button>
                <button onClick={() => setShowPublish(false)} className="w-full font-sans text-[13px] text-[#7d7a74] py-2 hover:text-brand-ink">Cancel</button>
              </>
            ) : (
              <>
                <h2 className="font-lora text-[27px] mb-2 leading-[1.1]">Claim your link &amp; publish</h2>
                <p className="text-[14px] text-[#57524c] leading-[1.55] mb-4">Pick your username — this is your public profile URL. You can re-publish anytime.</p>
                <div className="flex items-center border border-[#E1DED7] mb-3">
                  <span className="text-[13px] text-[#7d7a74] pl-3 shrink-0">marquee.bio/</span>
                  <input value={pubUsername} onChange={(e) => setPubUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="yourname" className="flex-1 min-w-0 font-sans text-[14px] py-[11px] px-1 focus:outline-none" />
                </div>
                {pubResult && !pubResult.ok && <div className="text-[13px] text-[#AB0000] mb-3">{pubResult.msg}</div>}
                <button onClick={publish} disabled={publishing || !pubUsername.trim()} className="w-full font-sans bg-brand-ink text-white text-[14px] font-semibold py-[13px] mb-2 disabled:opacity-40">{publishing ? "Publishing…" : "Publish my profile →"}</button>
                <button onClick={() => setShowPublish(false)} className="w-full font-sans text-[13px] text-[#7d7a74] py-2 hover:text-brand-ink">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Drag the photo inside a frame shaped like the header's photo box; the slider zooms.
// Position is stored as 0–100 each way, so the profile can reproduce it at any size.
function PhotoFramer({ url, pos, zoom, onPos, onZoom }: { url: string; pos: { x: number; y: number }; zoom: number; onPos: (p: { x: number; y: number }) => void; onZoom: (z: number) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  // how far the photo overhangs the frame, in pixels, on each axis
  const overhang = () => {
    const f = frame.current, i = img.current;
    if (!f || !i || !i.naturalWidth) return { ox: 0, oy: 0 };
    const fit = Math.max(f.clientWidth / i.naturalWidth, f.clientHeight / i.naturalHeight) * zoom;
    return { ox: i.naturalWidth * fit - f.clientWidth, oy: i.naturalHeight * fit - f.clientHeight };
  };
  const at = `${pos.x}% ${pos.y}%`;
  return (
    <div className="mt-4 flex flex-wrap items-start gap-[18px]">
      <div
        ref={frame}
        role="img"
        aria-label="Header photo. Drag to reposition."
        className="w-[200px] aspect-square overflow-hidden border border-[#E1DED7] bg-[#ECEAE3] shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }; }}
        onPointerMove={(e) => {
          const d = drag.current; if (!d) return;
          const { ox, oy } = overhang();
          onPos({ x: ox > 1 ? clamp(d.x - ((e.clientX - d.px) / ox) * 100) : d.x, y: oy > 1 ? clamp(d.y - ((e.clientY - d.py) / oy) * 100) : d.y });
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <img ref={img} src={url} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: at, transformOrigin: at, transform: zoom > 1 ? `scale(${zoom})` : undefined }} />
      </div>
      <div className="max-w-[260px]">
        <div className="font-sans text-[13px] font-semibold mb-1">Position your photo</div>
        <p className="text-[12px] text-[#7d7a74] leading-[1.5] mb-3">Drag the photo to choose what shows in your header. This frame is the same shape as the one on your profile.</p>
        <label htmlFor="f-photo-zoom" className="font-sans text-[12px] text-[#7d7a74] block mb-1">Zoom</label>
        <input id="f-photo-zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => onZoom(Number(e.target.value))} className="w-[200px] accent-[#2E2C28]" />
        <div><button onClick={() => { onPos({ x: 50, y: 25 }); onZoom(1); }} className="font-sans text-[12px] text-[#7d7a74] underline underline-offset-2 hover:text-brand-ink mt-2">Reset</button></div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, max, textarea }: { label: string; value: string; onChange: (v: string) => void; max?: number; textarea?: boolean }) {
  // Stable id from the label so clicking the label focuses its input (a11y) and the field is addressable.
  const id = "f-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="font-sans text-[13px] font-semibold cursor-pointer">{label}</label>
        {max ? <span className="text-[11px] text-[#7d7a74]">{value.length} / {max}</span> : null}
      </div>
      {textarea ? (
        <textarea id={id} value={value} maxLength={max} rows={3} onChange={(e) => onChange(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink resize-none" />
      ) : (
        <input id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} className="w-full font-inter text-[14px] py-[10px] px-[13px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
      )}
    </div>
  );
}

function SocialField({ label, v, on, ph }: { label: string; v: string; on: (x: string) => void; ph: string }) {
  return (
    <div>
      <label className="font-sans text-[12px] text-[#7d7a74] block mb-1">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} placeholder={ph} className="w-full font-inter text-[13.5px] py-[9px] px-[12px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
    </div>
  );
}

function MiniStat({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <input value={value} inputMode="numeric" onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} className="w-full font-sans text-[20px] font-semibold py-[6px] px-[8px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink" />
      <div className="text-[11px] text-[#7d7a74] mt-1">{label}</div>
    </div>
  );
}

function PvStat({ v, l }: { v: string; l: string }) {
  return <div><div className="font-sans text-[18px] font-semibold">{v}</div><div className="text-[10.5px] text-[#7d7a74]">{l}</div></div>;
}
