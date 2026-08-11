// ─────────────────────────────────────────────────────────────────────────
// CAREER BLUEPRINT — generation engine.
//
// Turns the 39 answers into the results object. Consolidated from the PRD's
// 8 calls into 2 for cost/latency (8 Opus calls/user would blow the <$0.10
// target): (1) an optional web-research pass over the people the user admires,
// (2) one structured generation pass that writes every result section.
//
// MODEL: claude-opus-5 (per the current Claude API guidance). This is the
// quality/cost lever — swap GEN_MODEL to "claude-sonnet-5" to roughly halve
// cost + latency if Sarah wants. Flagged for her decision.
//
// TRUST: no fabricated "72% success rate" stats (Sarah's call). Pay ranges are
// generated but must be labeled as estimates in the UI, not researched fact.
// ─────────────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { QUESTIONS, PROFILE_TYPES, type BlueprintQuestion } from "./questions";

// Default to Sonnet 5 — near-Opus quality on this task at ~half the latency/cost,
// which matters for a free top-of-funnel quiz at scale. Swap to "claude-opus-5"
// for max quality. (web_search_20260209 is supported on Sonnet 5.)
const GEN_MODEL = "claude-sonnet-5";
const RESEARCH_MODEL = "claude-sonnet-5";

let _client: Anthropic | null = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return _client;
}

// ── result shape ──
export interface IncomePath {
  name: string;
  pay_range: string; // labeled as an estimate in the UI
  description: string;
  fit_reasoning: string;
  roles: string[];
  where_to_look: string[];
  the_leap: string;
  time_to_revenue: string;
}
// Every tool / resource carries a link. url may be "" — the UI falls back to a
// search link so nothing is ever un-clickable.
export interface LinkedItem { name: string; url: string; }
export interface PlanWeek {
  week: number;
  title: string;
  action: string;
  why: string;
  tools: LinkedItem[];
  success_metric: string;
}
export interface Blocker { name: string; solution: string; first_step: string; }
export interface Dimension { name: string; score: number; label: string; reasoning: string; }
export interface Playbook { name: string; career_path: string; steal_this: string; researched: boolean; }
export interface Resources {
  people: LinkedItem[]; communities: LinkedItem[]; courses: LinkedItem[]; books: LinkedItem[]; podcasts: LinkedItem[];
}
export interface MarqueeMove { feature: string; recommendation: string; }
export interface BlueprintResult {
  profile_types: string[];
  headline: string; // e.g. "Creator / Coach"
  portrait: string; // 2-3 sentence narrative
  superpowers: { name: string; evidence: string }[];
  income_paths: IncomePath[];
  action_plan: PlanWeek[];
  blockers: Blocker[];
  dimensions: Dimension[];
  playbooks: Playbook[];
  resources: Resources;
  marquee_showcase: MarqueeMove[];
  meta: { model: string; ms: number; researched_people: number };
}

type Answers = Record<string, any>;

// Render answers into a readable transcript the model can reason over.
function transcript(answers: Answers): string {
  return QUESTIONS.map((q: BlueprintQuestion) => {
    const v = answers[q.id];
    let val = "(skipped)";
    if (q.id === "prof-id" && Array.isArray(v)) {
      val = v.map((id: string) => PROFILE_TYPES.find((t) => t.id === id)?.label || id).join(", ");
    } else if (q.type === "peoplelist" && Array.isArray(v)) {
      val = v.filter((p: any) => p?.name?.trim()).map((p: any) => `${p.name}${p.why ? ` (${p.why})` : ""}`).join("; ");
    } else if (q.type === "matrix" && v && typeof v === "object") {
      val = Object.keys(v).map((k) => k.replace(/-(today|future)$/, (_m, c) => ` [${c}]`)).join(", ");
    } else if (Array.isArray(v)) {
      val = v.filter(Boolean).join(", ");
    } else if (v != null && String(v).trim()) {
      val = String(v);
    }
    return `[${q.cat}] ${q.prompt}\n→ ${val}`;
  }).join("\n\n");
}

function textOf(msg: Anthropic.Message): string {
  return msg.content.filter((b) => b.type === "text").map((b: any) => b.text).join("\n");
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
}

// ── 1. Research the people they admire (web search). Returns [] if none. ──
async function researchAdmired(answers: Answers): Promise<{ text: string; count: number }> {
  const people: { name: string; why: string }[] = (answers["admire"] || []).filter((p: any) => p?.name?.trim());
  if (people.length === 0) return { text: "", count: 0 };

  const names = people.map((p) => `- ${p.name}${p.why ? ` — the user admires them because: ${p.why}` : ""}`).join("\n");
  const msg = await client().messages.create({
    model: RESEARCH_MODEL,
    max_tokens: 4000,
    tools: [{ type: "web_search_20260209", name: "web_search" } as any],
    messages: [{
      role: "user",
      content:
        `Research each person below and write a short, factual playbook for each. If you cannot verify who someone is, say "research unavailable for <name>" — do NOT invent facts.\n\n` +
        `${names}\n\n` +
        `For each, 3-4 sentences: their actual career path, how they built what they built, and the one repeatable move someone could learn from them. Plain prose, one paragraph per person, lead with the name.`,
    }],
  });
  return { text: textOf(msg), count: people.length };
}

// ── 2. Generate the full blueprint (one structured pass). ──
export async function generateBlueprint(answers: Answers): Promise<BlueprintResult> {
  const started = Date.now();
  const research = await researchAdmired(answers);

  const schema = `{
  "headline": "the user's selected profile type(s), e.g. 'Creator / Coach' or 'Professional'",
  "portrait": "2-3 sentence narrative portrait grounded in THEIR answers. Specific, no clichés, no 'passionate'/'results-driven'.",
  "superpowers": [{ "name": "short", "evidence": "which answers show this" }],
  "income_paths": [{ "name": "", "pay_range": "realistic ESTIMATE range", "description": "1-2 sentences", "fit_reasoning": "why it fits THEM", "roles": ["3-4"], "where_to_look": ["communities/boards/networks"], "the_leap": "one concrete first step", "time_to_revenue": "e.g. 4-8 weeks" }],
  "action_plan": [{ "week": 1, "title": "", "action": "specific, not generic", "why": "ties to a blocker/goal", "tools": [{ "name": "specific tool", "url": "the tool's official URL" }], "success_metric": "how they know it worked" }],
  "blockers": [{ "name": "", "solution": "specific, routes around their constraints", "first_step": "the first concrete thing to do this week" }],
  "dimensions": [{ "name": "Risk Appetite|Clarity|Builder vs Operator|Visibility|Meaning vs Money|Readiness to Change|Network Strength|Specialist vs Generalist", "score": 0-100, "label": "short", "reasoning": "1 sentence" }],
  "playbooks": [{ "name": "person", "career_path": "X → Y → Z", "steal_this": "specific move", "researched": true }],
  "resources": { "people": [{ "name": "person", "url": "their site or main profile" }], "communities": [{ "name": "community", "url": "join/site URL" }], "courses": [{ "name": "SPECIFIC named course + platform, e.g. 'Write of Passage (Maven)' — never a generic 'take a course'", "url": "the course page" }], "books": [{ "name": "title — author", "url": "book page" }], "podcasts": [{ "name": "show — why", "url": "listen link" }] },
  "marquee_showcase": [{ "feature": "one of: Work With Me | Book Time | The 4 Actions | Highlights | Media | Experience | Testimonials", "recommendation": "concrete, tied to THEIR answers — e.g. 'Offer a $12K Positioning Sprint under Work With Me' or 'Set your 4 Actions to: Book a coaching call · Read the newsletter · Book a positioning sprint · Listen to <their podcast>'" }]
}`;

  const msg = await client().messages.create({
    model: GEN_MODEL,
    max_tokens: 16000,
    system:
      "You are a sharp, specific career strategist building a personalized Career Blueprint from a professional's self-assessment. " +
      "Everything you write must be tailored to THEIR actual answers — never generic archetype filler. " +
      "VOICE: Write plain, direct, human sentences — a smart, warm expert who says the real thing. NO consultant jargon, NO buzzwords, NO vague abstractions. " +
      "NEVER use these words/phrases or anything like them: 'foggy', 'wants the mic', 'underleveraged', 'leverage' (as a verb), 'pace of change', 'where you lean', \"what's in your way\", 'legacy', 'lean into', 'unlock', 'double down', 'done when', 'pull', 'clarity of purpose'. " +
      "Name the specific offer, number, role, or action — never gesture vaguely at it. If a sentence could appear on anyone's blueprint, rewrite it so it could only be on theirs. " +
      "LINKS: Every tool, course, book, podcast, community, and person you name MUST include a real working URL — the official homepage, the Maven/course page, the book's page (publisher or Amazon), the podcast's listen link, the person's own site. Prefer official sources; if you're unsure of the exact URL, give the best official one you know. " +
      "CHANNELS: Do NOT default to LinkedIn. Recommend the channels that actually fit THIS person — newsletters/Substack, niche communities, Maven cohorts, podcasts, in-person, wherever their world lives. Only name LinkedIn if it's genuinely the best fit, never as the automatic answer. " +
      "Do NOT invent statistics or success rates. Pay ranges are clearly framed as estimates, never as researched fact. " +
      "If research on an admired person was unavailable, omit them from playbooks rather than guessing. " +
      "Courses must be SPECIFIC and real (named course + platform), never 'take a marketing course'. " +
      "Marquee is a personal-brand profile platform. In marquee_showcase, give 4-6 concrete recommendations for how THIS person should use Marquee to turn this Blueprint into a profile that converts — map their strengths and income paths to real Marquee features: Work With Me (list their specific offerings + rates), Book Time (let people book a coaching/advisory call directly), The 4 Actions (the top-of-profile CTA row — recommend their exact 4), Highlights (what proof to feature), Media, Experience, Testimonials. Be specific to their answers. " +
      "Provide 8 dimensions (exactly the names listed), 3-4 income paths, a 4-week plan (weeks 1-4), 2-4 blockers, 4-6 marquee_showcase moves.",
    messages: [{
      role: "user",
      content:
        `Here is the professional's assessment:\n\n${transcript(answers)}\n\n` +
        (research.text ? `Researched context on people they admire (use for the playbooks + resources; ignore any 'research unavailable' entries):\n\n${research.text}\n\n` : "") +
        `Return ONLY valid JSON matching this exact shape (no prose, no markdown fence):\n\n${schema}`,
    }],
  });

  const parsed = parseJSON<Omit<BlueprintResult, "profile_types" | "meta">>(textOf(msg));
  return {
    ...parsed,
    profile_types: answers["prof-id"] || [],
    meta: { model: GEN_MODEL, ms: Date.now() - started, researched_people: research.count },
  };
}
