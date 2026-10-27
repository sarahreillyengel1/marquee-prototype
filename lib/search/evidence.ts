// ─────────────────────────────────────────────────────────────
// Find an Expert, step 1: read a storefront into search rows.
//
// A chip is a claim. Work is evidence. This file turns a published Profile into
//   - one index row: the text a search runs over, the facets it can filter on, the card a result shows
//   - evidence rows: one per role, result, course, newsletter, talk, board seat, testimonial…
//     each with the page it sits on, the member's own words, and (later) the topics it supports.
// Pure functions. No DB, no Claude. Topics are added in topics.ts.
// ─────────────────────────────────────────────────────────────
import { createHash } from "crypto";
import type { Profile } from "../profile-types";
import { parsePriceCents } from "../booking";

export type EvidenceKind =
  | "did_it"          // a role held, a project delivered
  | "got_results"     // an impact item, a metric on a role
  | "taught_it"       // a course, workshop, class, faculty role
  | "wrote_or_spoke"  // newsletter, podcast, article, video, book
  | "was_asked"       // press that quoted them, a talk they were invited to give, a board seat
  | "others_say"      // a testimonial, with who said it
  | "has_audience"    // reach on a platform
  | "credential"      // degree, certification
  | "offer"           // a Work with me offer or a product: how you engage, not proof on its own
  | "claim";          // skills, superpowers, values, leadership type, the bio: describes the person

export type EvidencePage = "profile" | "experience" | "media" | "shop" | "workwith" | "testimonials" | "reach" | "education";

/** Which builder Hide key turns each page off. The bio on the Profile home is never hidden. */
const HIDE_KEY: Record<EvidencePage, string | null> = {
  profile: null, experience: "experience", media: "media", shop: "store", workwith: "workwith",
  testimonials: "testimonials", reach: "reach", education: "education",
};
/** Claims live on the Profile home but hide with their own section. */
const CLAIM_HIDE: Record<string, string> = { skills: "skills", superpowers: "superpowers", values: "values", leadership: "leadership", impact: "impact" };

const WEIGHT: Record<EvidenceKind, number> = {
  got_results: 5, did_it: 4, taught_it: 4, was_asked: 4, others_say: 3, wrote_or_spoke: 3, credential: 2, offer: 2, has_audience: 1, claim: 1,
};

export interface EvidenceRow {
  kind: EvidenceKind;
  page: EvidencePage;
  item_id?: string;
  title: string;
  body: string;
  date_text?: string;
  source?: string;
  url?: string;
  topics: string[];
  /** pre-set topics that need no Claude call (skills are their own topics) */
  fixedTopics?: boolean;
  hash: string;
  hidden: boolean;
  weight: number;
}

/** Facts that only the builder snapshot knows (the published Profile drops them). All optional. */
export interface SnapshotExtras {
  types?: string[];
  industries?: string[];
  openToFullTime?: boolean;
  fullTimeRoles?: string;
}

export interface IndexRow {
  kind: "professional";
  username: string;
  title: string;
  subtitle: string;
  body: string;
  private_body: string;
  facets: Record<string, unknown>;
  private_facets: Record<string, unknown>;
  card: Record<string, unknown>;
}

const clean = (s?: string) => (s || "").replace(/\s+/g, " ").trim();
const sha = (parts: string[]) => createHash("sha1").update(parts.join("|")).digest("hex");
const lower = (xs: string[]) => Array.from(new Set(xs.map((x) => clean(x).toLowerCase()).filter(Boolean)));

function row(p: { kind: EvidenceKind; page: EvidencePage; title: string; body?: string; item_id?: string; date_text?: string; source?: string; url?: string; topics?: string[]; fixedTopics?: boolean }, hidden: Set<string>, hideKey?: string | null): EvidenceRow {
  const title = clean(p.title), body = clean(p.body);
  const key = hideKey === undefined ? HIDE_KEY[p.page] : hideKey;
  return {
    kind: p.kind, page: p.page, item_id: p.item_id, title, body,
    date_text: clean(p.date_text) || undefined, source: clean(p.source) || undefined, url: p.url || undefined,
    topics: p.topics ? lower(p.topics) : [], fixedTopics: !!p.fixedTopics,
    hash: sha([p.kind, p.page, title, body, clean(p.source)]),
    hidden: !!key && hidden.has(key),
    weight: WEIGHT[p.kind],
  };
}

const TEACHING = /course|workshop|class|cohort|masterclass|bootcamp|curriculum|guide|playbook|template|training|lesson/i;
const BOARD = /board|advis/i;

/** Every piece of evidence on the storefront, in reading order. `hidden` is the builder's Hide set. */
export function evidenceFromProfile(p: Profile, hidden: Set<string>): EvidenceRow[] {
  const out: EvidenceRow[] = [];

  // Profile home: the bio, in the member's words. Never hidden. This is where "who I work with" lives.
  const bio = [p.tagline, p.bioShort, ...(p.bioLong || [])].map(clean).filter(Boolean).join(" ");
  if (bio) out.push(row({ kind: "claim", page: "profile", item_id: "bio", title: clean(p.headline) || clean(p.name), body: bio }, hidden, null));
  if (p.previous?.length) out.push(row({ kind: "did_it", page: "profile", item_id: "previous", title: "Previously", body: p.previous.join(", "), topics: p.previous, fixedTopics: true }, hidden, null));

  // Experience: roles are "did it"; a board or advisory seat is "was asked"; a result on a role is "got results".
  for (const r of p.roles || []) {
    const isSeat = r.kind !== "project" && BOARD.test(r.label || "") ;
    const title = [r.role, r.company].filter(Boolean).join(" at ");
    const body = [r.blurb, ...(r.highlights || [])].map(clean).filter(Boolean).join(" ");
    out.push(row({ kind: isSeat ? "was_asked" : "did_it", page: "experience", item_id: r.id, title: r.kind === "project" ? `${r.label || "Project"}: ${title}` : title, body, date_text: r.dates, source: r.company, url: undefined,
      topics: [...(r.industries || []), r.stage || ""].filter(Boolean) }, hidden));
    for (const m of r.metrics || []) if (clean(m.value)) out.push(row({ kind: "got_results", page: "experience", item_id: `${r.id}-result`, title: clean(m.value), body: [m.label, `at ${r.company}`].filter(Boolean).join(" "), date_text: r.dates, source: r.company }, hidden));
  }

  // Impact: results the member chose to call out.
  for (const [i, im] of (p.impact || []).entries()) {
    out.push(row({ kind: "got_results", page: "experience", item_id: `impact${i}`, title: clean(im.label) || clean(im.value), body: clean(im.sub) }, hidden, CLAIM_HIDE.impact));
  }

  // Media: what they wrote, made or said, and what they were asked to say.
  for (const m of p.media || []) {
    const asked = m.type === "Press" || m.type === "Speaking" || m.type === "Board";
    out.push(row({ kind: asked ? "was_asked" : "wrote_or_spoke", page: "media", item_id: m.id, title: `${m.type}: ${m.title}`, body: clean(m.sub), source: m.source, url: m.url }, hidden));
  }

  // Shop: a course or workshop is teaching; anything else is a product they made.
  for (const s of p.store || []) {
    const teaches = TEACHING.test(`${s.kind} ${s.title}`);
    out.push(row({ kind: teaches ? "taught_it" : "offer", page: "shop", item_id: s.id, title: `${s.kind}: ${s.title}`, body: [s.blurb, s.price ? `Price ${s.price}` : ""].filter(Boolean).join(". "), url: s.url }, hidden));
  }

  // Work with me: how you engage, with the topics the member named. A workshop offer is also teaching.
  for (const [i, e] of (p.engagements || []).entries()) {
    const teaches = TEACHING.test(e.title);
    out.push(row({ kind: teaches ? "taught_it" : "offer", page: "workwith", item_id: `offer${i}`, title: e.title, body: [e.blurb, e.topics?.length ? `${e.topicsLabel || "Topics"}: ${e.topics.join(", ")}` : "", e.rateDisplay === "show" ? `Rate ${e.price}` : "Rate on request"].filter(Boolean).join(". "), topics: e.topics || [] }, hidden));
  }

  // Testimonials: what a client said, and who.
  if (p.testimonial?.quote) out.push(row({ kind: "others_say", page: "testimonials", item_id: "testimonial", title: "What a client says", body: p.testimonial.quote, source: p.testimonial.who }, hidden));

  // Reach: an audience, weak on its own.
  for (const [i, r] of (p.reach || []).entries()) {
    out.push(row({ kind: "has_audience", page: "reach", item_id: `reach${i}`, title: `${r.platform}: ${r.followers}`, body: [r.handle, r.engagement ? `engagement ${r.engagement}` : ""].filter(Boolean).join(" "), url: r.url, topics: [r.platform], fixedTopics: true }, hidden));
  }

  // Education and certifications.
  for (const c of p.education || []) {
    out.push(row({ kind: "credential", page: "education", item_id: c.id, title: c.title, body: clean(c.sub) }, hidden));
  }

  // Claims: describe the person, help the match, prove nothing on their own. Skills are their own topics.
  const skills = (p.skills || []).map((k) => k.name).filter(Boolean);
  if (skills.length) out.push(row({ kind: "claim", page: "profile", item_id: "skills", title: "Skills", body: skills.join(", "), topics: skills, fixedTopics: true }, hidden, CLAIM_HIDE.skills));
  for (const [i, s] of (p.superpowers || []).entries()) out.push(row({ kind: "claim", page: "profile", item_id: `power${i}`, title: s.title, body: clean(s.blurb) }, hidden, CLAIM_HIDE.superpowers));
  const vals = (p.values || []).map((v) => v.name).filter(Boolean);
  if (vals.length) out.push(row({ kind: "claim", page: "profile", item_id: "values", title: "Values", body: vals.join(", "), topics: vals, fixedTopics: true }, hidden, CLAIM_HIDE.values));
  const arch = (p.leadership || []).map((l) => l.title).filter(Boolean);
  if (arch.length || clean(p.leadershipBelief)) out.push(row({ kind: "claim", page: "profile", item_id: "leadership", title: arch.length ? `Leads as: ${arch.join(", ")}` : "How I lead", body: clean(p.leadershipBelief), topics: arch, fixedTopics: true }, hidden, CLAIM_HIDE.leadership));

  return out;
}

const RATE_BUCKET = (cents: number, unit: string) => {
  if (!cents) return undefined;
  if (/hour|hr/i.test(unit)) return cents < 15000 ? "under_150_hr" : cents < 30000 ? "150_300_hr" : "300_plus_hr";
  return "day_month_or_project";
};

/** The index row: body text, facets, and the card. `extras` come from the builder snapshot at Publish; empty on a backfill. */
export function indexRowFromProfile(p: Profile, username: string, hidden: Set<string>, extras: SnapshotExtras, evidence: EvidenceRow[]): IndexRow {
  const pub = evidence.filter((e) => !e.hidden), priv = evidence.filter((e) => e.hidden);
  const text = (rows: EvidenceRow[]) => rows.map((e) => [e.title, e.body, e.source].filter(Boolean).join(". ")).join("\n");

  const ways = lower((p.openTo || []).map((o) => o.key));
  const industries = lower([...(extras.industries || []), ...(p.roles || []).flatMap((r) => r.industries || [])]);
  const stages = lower((p.roles || []).map((r) => r.stage || ""));
  const firstOffer = (p.engagements || [])[0];
  const rateCents = (p.engagements || []).map((e) => (e.rateDisplay === "show" ? parsePriceCents(e.price) : 0)).filter((c) => c > 0);
  const kinds = new Set(pub.map((e) => e.kind));
  const has = (k: EvidenceKind) => kinds.has(k);

  const facets: Record<string, unknown> = {
    types: lower(extras.types || []),
    ways,
    skills: hidden.has("skills") ? [] : lower((p.skills || []).map((k) => k.name)),
    industries, stages,
    archetypes: hidden.has("leadership") ? [] : lower((p.leadership || []).map((l) => l.title)),
    values: hidden.has("values") ? [] : lower((p.values || []).map((v) => v.name)),
    location: clean(p.location), available: !!p.available, availableLabel: clean(p.availableLabel),
    yearsLeading: hidden.has("leadership") ? undefined : p.leadershipMeta?.yearsLeading,
    largestTeam: hidden.has("leadership") ? undefined : p.leadershipMeta?.largestTeam,
    rateMinCents: rateCents.length ? Math.min(...rateCents) : undefined,
    rateBucket: firstOffer && firstOffer.rateDisplay === "show" ? RATE_BUCKET(parsePriceCents(firstOffer.price), firstOffer.price) : undefined,
    evidence: {
      didIt: has("did_it"), gotResults: has("got_results"), taughtIt: has("taught_it"), wroteOrSpoke: has("wrote_or_spoke"),
      wasAsked: has("was_asked"), othersSay: has("others_say"), hasAudience: has("has_audience"),
      newsletter: pub.some((e) => /^Newsletter:/.test(e.title)), podcast: pub.some((e) => /^Podcast:/.test(e.title)),
      speaking: pub.some((e) => /^Speaking:/.test(e.title)), press: pub.some((e) => /^Press:/.test(e.title)),
      board: pub.some((e) => e.kind === "was_asked" && e.page === "experience"),
    },
  };
  // Search-only facts: never on a card. MBTI and enneagram by the Oct 15 visibility rule; open to full-time likewise.
  const private_facets: Record<string, unknown> = {
    mbti: p.leadershipMeta?.mbti, enneagram: p.leadershipMeta?.enneagram,
    openToFullTime: !!extras.openToFullTime, fullTimeRoles: clean(extras.fullTimeRoles) || undefined,
    hiddenSections: Array.from(hidden),
    // what a hidden section would have put in the public facets
    skills: hidden.has("skills") ? lower((p.skills || []).map((k) => k.name)) : undefined,
    values: hidden.has("values") ? lower((p.values || []).map((v) => v.name)) : undefined,
    archetypes: hidden.has("leadership") ? lower((p.leadership || []).map((l) => l.title)) : undefined,
    yearsLeading: hidden.has("leadership") ? p.leadershipMeta?.yearsLeading : undefined,
  };
  for (const k of Object.keys(private_facets)) if (private_facets[k] === undefined) delete private_facets[k];
  for (const k of Object.keys(facets)) if (facets[k] === undefined) delete facets[k];

  const latest = hidden.has("media") ? [] : (p.media || []).slice(0, 2).map((m) => ({ type: m.type, title: m.title }));
  const card = {
    username, name: clean(p.name), headline: clean(p.headline), location: clean(p.location),
    availableLabel: clean(p.availableLabel), photoUrl: p.photoUrl || "", verified: !!p.verified,
    ways: hidden.has("workwith") ? [] : (p.openTo || []).map((o) => o.label),
    offer: !hidden.has("workwith") && firstOffer ? { title: firstOffer.title, price: firstOffer.rateDisplay === "show" ? firstOffer.price : "Rate on request", flow: firstOffer.flow } : undefined,
    latest,
    tags: (p.tags || []).slice(0, 4),
  };

  return {
    kind: "professional", username,
    title: clean(p.name), subtitle: clean(p.headline),
    body: [clean(p.location), (p.searchTags || []).join(", "), text(pub)].filter(Boolean).join("\n"),
    private_body: text(priv),
    facets, private_facets, card,
  };
}

/** An opportunity's index row, from the opportunities table row. */
export function indexRowFromOpportunity(o: Record<string, unknown>): { kind: "opportunity"; opportunity_id: number; title: string; subtitle: string; body: string; facets: Record<string, unknown>; card: Record<string, unknown>; published_at: string | null } {
  const s = (k: string) => clean(typeof o[k] === "string" ? (o[k] as string) : "");
  const n = (k: string) => (typeof o[k] === "number" ? (o[k] as number) : null);
  const arr = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).map((x) => clean(String(x))).filter(Boolean) : []);
  const pay = n("pay_min") || n("pay_max") ? [n("pay_min") ? `$${n("pay_min")!.toLocaleString()}` : "", n("pay_max") ? `$${n("pay_max")!.toLocaleString()}` : ""].filter(Boolean).join(" to ") + (s("pay_per") ? ` / ${s("pay_per")}` : "") : s("pay_note");
  return {
    kind: "opportunity", opportunity_id: Number(o.id),
    title: s("title"), subtitle: s("company"),
    body: [s("company_blurb"), s("description"), arr("responsibilities").join(". "), arr("requirements").join(". "), arr("skills").join(", "), s("location"), s("work_type"), s("function"), s("seniority"), s("start_text"), s("length_text")].filter(Boolean).join("\n"),
    facets: {
      workType: s("work_type"), function: s("function") || undefined, seniority: s("seniority") || undefined,
      location: s("location") || undefined, remote: s("remote") || undefined,
      payMin: n("pay_min") ?? undefined, payMax: n("pay_max") ?? undefined, payPer: s("pay_per") || undefined,
      hoursPerWeek: n("hours_per_week") ?? undefined, skills: lower(arr("skills")), featured: !!o.featured, requireMarquee: s("require_marquee") || undefined,
      deadline: s("deadline") || undefined,
    },
    card: { slug: s("slug"), title: s("title"), company: s("company"), workType: s("work_type"), pay, hours: n("hours_per_week") ? `${n("hours_per_week")} hrs/wk` : s("length_text"), location: [s("location"), s("remote") !== "unknown" ? s("remote") : ""].filter(Boolean).join(", "), applyOnMarquee: s("apply_url") === "apply:marquee" },
    published_at: typeof o.published_at === "string" ? (o.published_at as string) : null,
  };
}
