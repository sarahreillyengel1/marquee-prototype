// ─────────────────────────────────────────────────────────────
// Fresh mapper: the /build-preview builder's snapshot → the Profile view-model
// that ProfileView renders. Replaces the retired ELVISS profile-mapper for
// profiles created in the new builder. Pure function; no DB.
// ─────────────────────────────────────────────────────────────
import type {
  Profile, Role, MediaItem, Skill, Value, Superpower, LeadershipTrait,
  Credential, Engagement, OpenToItem, Social, EngagementKey, StoreItem, ReachStat, ProfileLook,
} from "./profile-types";

// The shape the builder autosaves (matches snapshot() in app/build-preview/page.tsx).
export interface BuilderSnapshot {
  types: string[]; name: string; headline: string; bio: string; photoUrl?: string; city: string; loc: string;
  openNow: boolean; dob: string;
  socials: { website: string; linkedin: string; instagram: string; x: string; tiktok: string; youtube: string; substack: string };
  focus: string;
  entries: { kind: "role" | "project"; primary: string; secondary: string; dates: string; desc: string; result: string; featured: boolean }[];
  arch: string[]; mbti: string; enn: string; disc: string;
  ledTeam: boolean; yearsLed: string; largestTeam: string; orgs: string; philosophy: string;
  ftEnabled: boolean; ftRoles: string;
  offers: { key: string; title: string; blurb: string; added: boolean; rate: string; unit: string; showRate: boolean; booking: string; desc: string; duration: string; length: string; cadence: string; keywords?: string }[];
  impacts: { headline: string; context: string; story: string }[];
  skills: { name: string; level: string; top: boolean }[];
  industries: string[]; learning: string[];
  vals: string[]; vFeatured: string[];
  media: { kind: string; title: string; outlet: string; url: string; featured: boolean; img?: string }[];
  testis: { quote: string; author: string; role: string; relationship: string; featured: boolean }[];
  edu: { school: string; degree: string; field: string; year: string }[];
  certs: string[];
  products: { kind: string; title: string; blurb: string; price: string; featured: boolean; url?: string }[];
  longBio: string;
  powers: { statement: string; proof: string; keywords: string[] }[];
  hidden?: string[];
  reach?: { key: string; handle: string; followers: string; engagement: string; url: string }[];
  audAge?: string; audGender?: string; audGeo?: string;
  calLink?: string;
  actions?: { type: string; label: string; dest: string; url: string }[];
  look?: string;
  previous?: string[];
  photoPos?: { x: number; y: number };
  photoZoom?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(n) || 0));
const LEVEL_SCORE: Record<string, number> = { Foundational: 25, Proficient: 55, Advanced: 80, Expert: 100 };
const MEDIA_TYPE: Record<string, MediaItem["type"]> = {
  Press: "Press", Talk: "Speaking", Podcast: "Podcast", Writing: "Newsletter",
  Portfolio: "Portfolio", Video: "Video", Deck: "Project",
};
const MEDIA_BG: Record<string, string> = {
  Press: "#E6E2D0", Speaking: "#C9DDF7", Podcast: "#CBD8C0", Newsletter: "#F0D3BE",
  Portfolio: "#B9CBB2", Video: "#141210", Project: "#D9E3EC",
};
const OFFER_ENGAGEMENT: Record<string, EngagementKey> = {
  office: "advisory", coaching: "advisory", advisory: "advisory",
  fractional: "fractional", project: "project", speaking: "speaking", content: "project",
};
const OFFER_ICON: Record<string, string> = {
  office: "compass", coaching: "compass", advisory: "users",
  fractional: "briefcase", project: "file", speaking: "play-circle", content: "file",
};
const FLOW: Record<string, Engagement["flow"]> = {
  book: "book", proposal: "proposal", availability: "availability", approval: "availability",
  request: "message", message: "message",
};
// Confirmed archetype set (Sept 2026) with the descriptions shown in the builder.
const ARCH_DESC: Record<string, string> = {
  "The Builder": "0→1, creation under ambiguity.", "The Fixer": "Diagnose, stabilize, turn around.",
  "The Scaler": "Takes what works and multiplies it.", "The Operator": "Systems, process, execution excellence.",
  "The Strategist": "Big picture, long arc, systems thinker.", "The Coach": "Grows people, builds culture, develops talent.",
  "The Connector": "Networks, partnerships, bridges worlds.", "The Visionary": "Sees what others don't, pulls people forward.",
};
const initials = (s: string) => (s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("") || "•").toUpperCase();
// Outbound links must be absolute — "linkedin.com/in/x" would otherwise resolve relative to the profile URL and 404.
const absUrl = (u?: string): string | undefined => { const v = (u || "").trim(); if (!v) return undefined; return /^(https?:\/\/|mailto:)/i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`; };

export function builderToProfile(s: BuilderSnapshot, username: string): Profile {
  const socials: Social[] = ([
    ["linkedin", s.socials?.linkedin], ["instagram", s.socials?.instagram], ["x", s.socials?.x],
    ["tiktok", s.socials?.tiktok], ["website", s.socials?.website],
  ] as const)
    .filter(([, url]) => url && url.trim())
    .map(([kind, url]) => ({ kind, url: absUrl(url as string) as string, visible: true }));

  const roles: Role[] = (s.entries || []).map((e, i) => ({
    id: `r${i}`, company: e.primary || "", logoLetter: initials(e.primary || "?"),
    role: e.secondary || "", dates: e.dates || "", blurb: e.desc || "", featured: !!e.featured,
    metrics: e.result ? [{ value: e.result, label: "" }] : [],
  }));

  const skills: Skill[] = (s.skills || []).map((k) => ({ name: k.name, score: LEVEL_SCORE[k.level] ?? 55, featured: !!k.top }));

  // Carry ALL chosen values; mark the featured ones (home shows featured, "View all" shows everything).
  const featuredVals = new Set(s.vFeatured || []);
  const values: Value[] = (s.vals || []).map((v) => ({ name: v, blurb: "", color: "#EAF1E6", icon: "check", featured: featuredVals.has(v) }));

  const superpowers: Superpower[] = (s.powers || [])
    .filter((p) => p.statement?.trim())
    .map((p) => ({ title: p.statement, blurb: p.proof || "", icon: "bolt" }));

  const leadership: LeadershipTrait[] = (s.arch || []).map((a) => ({ title: a, blurb: ARCH_DESC[a] || "", icon: "compass" }));
  const leadershipMeta = {
    mbti: s.mbti && s.mbti !== "I don't know" ? s.mbti : undefined,
    enneagram: s.enn && s.enn !== "I don't know" ? s.enn : undefined,
    yearsLeading: s.ledTeam && s.yearsLed ? s.yearsLed : undefined,
    largestTeam: s.ledTeam && s.largestTeam ? s.largestTeam : undefined,
  };

  const media: MediaItem[] = (s.media || []).filter((m) => m.title?.trim()).map((m, i) => {
    const type = MEDIA_TYPE[m.kind] ?? "Press";
    return { id: `m${i}`, type, title: m.title, featured: !!m.featured, bg: MEDIA_BG[type] ?? "#E6E2D0", image: m.img || undefined, darkText: type !== "Video", url: absUrl(m.url), source: m.outlet || undefined };
  });

  const education: Credential[] = [
    ...(s.edu || []).filter((e) => e.school?.trim()).map((e, i) => ({
      id: `e${i}`, short: initials(e.school), title: e.school,
      sub: [e.degree, e.field, e.year].filter(Boolean).join(" · "),
    })),
    ...(s.certs || []).filter((c) => c.trim()).map((c, i) => ({ id: `c${i}`, short: "✓", title: c, sub: "Certification" })),
  ];

  const impact = (s.impacts || []).filter((im) => im.headline?.trim()).map((im) => ({
    value: "", label: im.headline, sub: [im.context, im.story].filter(Boolean).join(" — "),
  }));

  const addedOffers = (s.offers || []).filter((o) => o.added);
  // "book" only works with a real scheduling link; otherwise fall back to the request form
  // (never the placeholder time-slot UI).
  const cal = (s.calLink || "").trim();
  const flowFor = (booking: string): Engagement["flow"] => { const f = FLOW[booking] ?? "message"; return f === "book" && !cal ? "message" : f; };
  const engagements: Engagement[] = addedOffers.map((o) => ({
    key: OFFER_ENGAGEMENT[o.key] ?? "project",
    icon: OFFER_ICON[o.key] ?? "file",
    title: o.title,
    price: o.showRate && o.rate ? `$${o.rate} ${o.unit}`.trim() : "Request",
    rateDisplay: o.showRate && o.rate ? "show" : "contact",
    blurb: o.desc || o.blurb || "",
    visible: true,
    flow: flowFor(o.booking),
  }));
  const openTo: OpenToItem[] = addedOffers.map((o) => ({
    key: OFFER_ENGAGEMENT[o.key] ?? "project", label: o.title,
    note: [o.duration || o.length || o.cadence].filter(Boolean).join(""), visible: true,
  }));

  const featuredTesti = (s.testis || []).find((t) => t.featured && t.quote?.trim()) || (s.testis || []).find((t) => t.quote?.trim());

  const bioLong = (s.longBio || "").split("\n").map((p) => p.trim()).filter(Boolean);

  const hide = new Set(s.hidden || []);

  // The 4-Actions bar under the hero: Work with me, an internal page, or a link.
  const actions = (s.actions || []).filter((a) => (a.label || "").trim()).slice(0, 4).map((a) => {
    if (a.dest === "link") return { type: a.type, label: a.label.trim(), destination: absUrl(a.url) || "#" };
    if (a.dest === "contact") return { type: a.type, label: a.label.trim(), destination: "contact" };
    return { type: a.type, label: a.label.trim(), destination: a.dest, internal: true };
  });

  const store: StoreItem[] = (s.products || []).filter((p) => p.title?.trim()).map((p, i) => ({
    id: `pr${i}`, kind: p.kind || "Product", title: p.title, featured: !!p.featured,
    blurb: p.blurb || undefined, price: p.price || undefined, url: absUrl(p.url),
  }));

  const reach: ReachStat[] = (s.reach || []).filter((p) => (p.followers || "").trim() || (p.handle || "").trim()).map((p) => ({
    platform: p.key, handle: p.handle || undefined, followers: p.followers || "",
    engagement: p.engagement || undefined, url: absUrl(p.url),
  }));
  const audience = (s.audAge || s.audGender || s.audGeo)
    ? { age: s.audAge || undefined, gender: s.audGender || undefined, geo: s.audGeo || undefined }
    : undefined;

  const LOOKS: ProfileLook[] = ["classic", "warm", "mono", "bold"];
  const look = LOOKS.find((l) => l === s.look);
  const previous = Array.from(new Set((s.previous || []).map((b) => b.trim()).filter(Boolean))).slice(0, 8);

  const searchTags = Array.from(new Set([
    ...previous,
    ...addedOffers.flatMap((o) => (o.keywords || "").split(",").map((t) => t.trim())),
    ...(s.industries || []),
    ...(s.skills || []).map((k) => k.name),
    ...(s.vals || []),
  ].filter(Boolean)));

  return {
    name: s.name || "",
    headline: s.headline || "",
    location: s.city || "",
    available: !!s.openNow,
    availableLabel: s.openNow ? "Open to opportunities" : "",
    verified: false,
    photoUrl: s.photoUrl || "",
    tagline: s.focus || "",
    look,
    previous,
    photoPos: s.photoPos ? { x: clamp(s.photoPos.x, 0, 100), y: clamp(s.photoPos.y, 0, 100) } : undefined,
    photoZoom: s.photoZoom ? clamp(s.photoZoom, 1, 3) : undefined,
    slug: username,
    tags: (s.skills || []).filter((k) => k.top).map((k) => k.name).slice(0, 6),
    searchTags,
    types: undefined,
    enabledSections: undefined,
    actions: hide.has("actions") ? [] : actions,
    bioShort: s.bio || "",
    bioLong,
    bookedFor: [],
    highlights: [],
    testimonial: !hide.has("testimonials") && featuredTesti ? { quote: featuredTesti.quote, who: [featuredTesti.author, featuredTesti.role].filter(Boolean).join(", ") } : undefined,
    socials,
    openTo: hide.has("workwith") ? [] : openTo,
    engagements: hide.has("workwith") ? [] : engagements,
    stats: [],
    activeProjects: [],
    roles: hide.has("experience") ? [] : roles,
    impact: hide.has("impact") ? [] : impact,
    leadership: hide.has("leadership") ? [] : leadership,
    leadershipBelief: hide.has("leadership") ? "" : (s.philosophy || ""),
    leadershipMeta: hide.has("leadership") ? undefined : leadershipMeta,
    values: hide.has("values") ? [] : values,
    superpowers: hide.has("superpowers") ? [] : superpowers,
    skills: hide.has("skills") ? [] : skills,
    media: hide.has("media") ? [] : media,
    portfolio: [],
    store: hide.has("store") ? [] : store,
    reach: hide.has("reach") ? [] : reach,
    audience: hide.has("reach") ? undefined : audience,
    calLink: absUrl(cal),
    education: hide.has("education") ? [] : education,
    sections: {
      impact: !hide.has("impact") && impact.length > 0,
      superpowers: !hide.has("superpowers") && superpowers.length > 0,
      media: !hide.has("media") && media.length > 0,
      education: !hide.has("education") && education.length > 0,
      activeProjects: false,
      portfolio: false,
    },
  };
}
