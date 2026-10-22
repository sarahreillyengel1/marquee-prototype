// Opportunities, Phase 1. Sarah pastes a link or the text; we pull the facts out with Claude, she checks them and publishes.
// Nothing is invented: a field the posting does not state stays empty.
import { callClaude, parseJSON } from "@/lib/claude";

export type OppStatus = "draft" | "published" | "paused" | "closed";
export const WORK_TYPES = ["full-time", "fractional", "advisory", "project", "contract", "interim", "board"] as const;
export const FUNCTIONS = ["marketing", "social", "ads", "content", "design", "growth", "revenue", "partnerships", "operations", "product", "technology", "ai", "finance", "accounting", "people", "strategy", "other"] as const;
export const SENIORITY = ["executive", "vp", "director", "senior", "mid", "other"] as const;
export const REMOTE = ["remote", "hybrid", "onsite", "unknown"] as const;
export const PAY_PER = ["hour", "month", "year", "project"] as const;
export const TYPE_LABEL: Record<string, string> = { "full-time": "Full-time", fractional: "Fractional", advisory: "Advisory", project: "Project", contract: "Contract", interim: "Interim", board: "Board" };
export const FUNCTION_LABEL: Record<string, string> = { marketing: "Marketing", social: "Social media", ads: "Paid ads", content: "Content", design: "Design / UI-UX", growth: "Growth", revenue: "Revenue", partnerships: "Partnerships", operations: "Operations", product: "Product", technology: "Technology", ai: "AI", finance: "Finance", accounting: "Accounting", people: "People", strategy: "Strategy", other: "Other" };
export const SENIORITY_LABEL: Record<string, string> = { executive: "Executive / C-suite", vp: "VP / Head of", director: "Director", senior: "Senior (5+ years)", mid: "Mid-level", other: "Other" };
export const REMOTE_LABEL: Record<string, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site", unknown: "" };

export interface Opportunity {
  id: number; slug: string; created_at: string; updated_at: string; status: OppStatus; featured: boolean;
  title: string; company: string; company_url: string | null; company_blurb: string | null;
  work_type: string; function: string | null; seniority: string | null; location: string | null; remote: string | null;
  pay_min: number | null; pay_max: number | null; pay_per: string | null; pay_note: string | null;
  hours_per_week: number | null; start_text: string | null; length_text: string | null;
  description: string | null; responsibilities: string[]; requirements: string[]; skills: string[];
  apply_url: string; source: string | null; source_url: string | null; deadline: string | null;
  last_checked_at: string | null; check_status: string | null; published_at: string | null; closed_at: string | null;
  posted_by?: string | null; poster_email?: string | null; poster_name?: string | null; require_marquee?: string | null;
}
export const REQUIRE = ["yes", "optional"] as const;
export const REQUIRE_LABEL: Record<string, string> = { yes: "Marquee required to apply", optional: "Marquee optional" };
export const BETA_POST_LIMIT = 2; // open opportunities per hiring account during the beta

// Posting needs a work email. These are personal mail providers.
const FREE_MAIL = ["gmail.", "googlemail.", "yahoo.", "ymail.", "rocketmail.", "hotmail.", "outlook.", "live.", "msn.", "aol.", "icloud.", "me.com", "mac.com", "proton.", "protonmail.", "pm.me", "gmx.", "mail.com", "mail.ru", "yandex.", "zoho.", "hey.com", "fastmail.", "duck.com", "tutanota.", "tuta.", "comcast.", "verizon.", "att.net", "sbcglobal.", "cox.net", "qq.com", "163.com", "126.com", "example."];
export function isBusinessEmail(email: string): boolean {
  const at = email.lastIndexOf("@"); if (at < 1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return false;
  return !FREE_MAIL.some((f) => domain === f || domain.startsWith(f) || domain.endsWith("." + f) || domain.endsWith("." + f.replace(/\.$/, "")));
}

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

/** "$8K–$10K / mo", "$210K–$240K", "$150 / hr", "$30K project", or the note when there are no numbers. */
export function payLabel(o: { pay_min: number | null; pay_max: number | null; pay_per: string | null; pay_note: string | null }): string {
  const k = (n: number) => (n >= 100000 || (n >= 10000 && n % 1000 === 0) ? `$${Math.round(n / 1000)}K` : n >= 10000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `$${n.toLocaleString()}`);
  const per = o.pay_per === "hour" ? " / hr" : o.pay_per === "month" ? " / mo" : o.pay_per === "year" ? " / yr" : o.pay_per === "project" ? " project" : "";
  if (o.pay_min && o.pay_max && o.pay_max !== o.pay_min) return `${k(o.pay_min)}–${k(o.pay_max)}${per}`;
  if (o.pay_min || o.pay_max) return `${k((o.pay_min || o.pay_max) as number)}${per}`;
  return o.pay_note || "";
}
export const timeAgo = (iso: string | null) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "Posted today" : d === 1 ? "Posted yesterday" : d < 7 ? `Posted ${d} days ago` : d < 14 ? "Posted 1 week ago" : d < 30 ? `Posted ${Math.floor(d / 7)} weeks ago` : `Posted ${Math.floor(d / 30)} month${d >= 60 ? "s" : ""} ago`;
};

/** Fetch a posting and return its readable text (JSON-LD JobPosting first, then the page), capped. */
export async function fetchPostingText(url: string): Promise<{ text: string; title: string; status: number }> {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", Accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  const html = await r.text();
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "").trim();
  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).filter((s) => /JobPosting/i.test(s)).join("\n");
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<nav[\s\S]*?<\/nav>/gi, " ").replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h[1-6]>|<\/div>|<\/tr>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&ndash;|&mdash;/g, "–")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  return { text: (ld ? `JSON-LD:\n${ld.slice(0, 6000)}\n\nPAGE:\n` : "") + body.slice(0, 16000), title, status: r.status };
}

export interface Extracted {
  title: string; company: string; company_url: string; company_blurb: string; work_type: string; function: string; seniority: string;
  location: string; remote: string; pay_min: number | null; pay_max: number | null; pay_per: string; pay_note: string;
  hours_per_week: number | null; start_text: string; length_text: string; description: string; responsibilities: string[]; requirements: string[]; skills: string[]; apply_url: string; deadline: string;
  found: string[];
}

/** Ask Claude for the facts in the posting. Empty means the posting did not say. */
export async function extractOpportunity(url: string, text: string): Promise<Extracted> {
  const prompt = `You are reading one job or engagement posting. Return only JSON with exactly these keys. If the posting does not state something, use "" or null (never guess, never invent pay, dates, hours or requirements).
{
 "title": "the role title as written",
 "company": "the hiring company name",
 "company_url": "the company's own website if stated, else \\"\\"",
 "company_blurb": "one short line about the company, taken from the posting, else \\"\\"",
 "work_type": one of ${JSON.stringify(WORK_TYPES)} based on the engagement actually described (fractional = part-time ongoing leadership; interim = temporary leadership cover; project/contract = scoped or time-boxed work; advisory/board = advisory seat; full-time = employee),
 "function": one of ${JSON.stringify(FUNCTIONS)},
 "seniority": one of ${JSON.stringify(SENIORITY)} (executive = C-level/founder-level; vp = VP or Head of; director; senior = 5+ years, senior IC or manager; mid = 2 to 5 years),
 "location": "city/region/country as written, else \\"\\"",
 "remote": one of ${JSON.stringify(REMOTE)},
 "pay_min": number in whole dollars or null,
 "pay_max": number in whole dollars or null,
 "pay_per": one of ${JSON.stringify(PAY_PER)} or "",
 "pay_note": "pay words that do not fit the numbers, exactly as written (\\"+ equity\\", \\"DOE\\"), else \\"\\"",
 "hours_per_week": number or null,
 "start_text": "start date or timing as written, else \\"\\"",
 "length_text": "engagement length as written, else \\"\\"",
 "description": "about the role and company in plain prose, 80 to 160 words, the posting's own facts only, no added adjectives",
 "responsibilities": array of up to 6 short strings from the posting,
 "requirements": array of up to 6 short strings from the posting,
 "skills": array of up to 8 short skill or domain strings from the posting,
 "apply_url": "the application link if the page states one different from ${url}, else \\"\\"",
 "deadline": "YYYY-MM-DD if a deadline is stated, else \\"\\""
}
Posting URL: ${url}
Posting text:
${text}`;
  const raw = await callClaude(prompt, "haiku");
  const j = await parseJSON<Record<string, unknown>>(raw);
  const s = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const n = (v: unknown) => (typeof v === "number" && isFinite(v) && v > 0 ? Math.round(v) : null);
  const arr = (v: unknown, max: number, len: number) => (Array.isArray(v) ? v.map((x) => s(x, len)).filter(Boolean).slice(0, max) : []);
  const pick = <T extends readonly string[]>(list: T, v: unknown, dflt: string) => (list.includes(s(v, 20) as never) ? s(v, 20) : dflt);
  const out: Extracted = {
    title: s(j.title, 140), company: s(j.company, 120), company_url: s(j.company_url, 300), company_blurb: s(j.company_blurb, 240),
    work_type: pick(WORK_TYPES, j.work_type, "full-time"), function: pick(FUNCTIONS, j.function, "other"), seniority: pick(SENIORITY, j.seniority, "other"),
    location: s(j.location, 120), remote: pick(REMOTE, j.remote, "unknown"),
    pay_min: n(j.pay_min), pay_max: n(j.pay_max), pay_per: pick(PAY_PER, j.pay_per, ""), pay_note: s(j.pay_note, 120),
    hours_per_week: n(j.hours_per_week), start_text: s(j.start_text, 80), length_text: s(j.length_text, 80),
    description: s(j.description, 2000), responsibilities: arr(j.responsibilities, 6, 200), requirements: arr(j.requirements, 6, 200), skills: arr(j.skills, 8, 40),
    apply_url: s(j.apply_url, 500) || url, deadline: /^\d{4}-\d{2}-\d{2}$/.test(s(j.deadline)) ? s(j.deadline) : "", found: [],
  };
  out.found = (["title", "company", "work_type", "location", "pay", "hours_per_week", "start_text", "length_text", "description", "responsibilities", "requirements"] as const)
    .filter((k) => k === "pay" ? !!(out.pay_min || out.pay_max || out.pay_note) : k === "responsibilities" || k === "requirements" ? out[k].length > 0 : !!out[k]);
  return out;
}

/** Does the posting still exist? A network blip is "error", not "gone". */
export async function checkPosting(url: string): Promise<"ok" | "gone" | "error"> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36" }, redirect: "follow", signal: AbortSignal.timeout(12000) });
    if (r.status === 404 || r.status === 410) return "gone";
    if (r.status >= 500) return "error";
    const html = (await r.text()).slice(0, 60000);
    if (/no longer (accepting|available|open)|position has been filled|job (has )?(closed|expired)|this job is closed|this posting has expired/i.test(html)) return "gone";
    return "ok";
  } catch { return "error"; }
}
