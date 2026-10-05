// Spotlight: the weekly editorial page at marquee.bio/spotlight.
// Items live in the spotlight_items table (lib/spotlight-schema.sql) and are edited at /admin/spotlight.

import { createServerSupabase } from "@/lib/supabase";

/** The sections of the page, in the order they appear. An item belongs to exactly one. */
export const SECTIONS = ["hero", "news", "featured", "event", "opportunity", "education", "community"] as const;
export type SpotlightType = (typeof SECTIONS)[number];
export const SPOTLIGHT_TYPES = SECTIONS;

export const SECTION_INFO: Record<SpotlightType, { title: string; add: string; help: string }> = {
  hero: { title: "Hero", add: "Set the hero article", help: "The big wine block at the top. The newest published one shows." },
  news: { title: "News", add: "Add a news item", help: "The row of three under the hero. The three newest published show." },
  featured: { title: "Featured", add: "Add a featured item", help: "The main feed with filter tabs. Kind decides the tab and the label." },
  event: { title: "Events", add: "Add an event", help: "Upcoming events, soonest first. Past events drop off on their own." },
  opportunity: { title: "Opportunities", add: "Add an opportunity", help: "Board, advisory, fractional and project work." },
  education: { title: "Education", add: "Add a course or guide", help: "Workshops, cohorts, guides and courses." },
  community: { title: "Communities", add: "Add a community", help: "A compact row of groups worth joining." },
};

/** The kinds offered per section in the editor. Free text is allowed too. */
export const KINDS: Record<SpotlightType, string[]> = {
  hero: ["Article", "Interview", "Essay"],
  news: ["Event", "Education", "Opportunity", "Article", "Marquee"],
  featured: ["Opportunity", "Event", "Education", "Article"],
  event: ["In person", "Online"],
  opportunity: ["Fractional", "Board", "Advisory", "Project", "Speaking", "Full-time"],
  education: ["Workshop", "Cohort", "Guide", "Course"],
  community: ["Slack", "Discord", "Membership", "Newsletter", "Meetup"],
};

export interface SpotlightItem {
  id: number;
  created_at: string;
  updated_at: string;
  type: SpotlightType;       // the section
  kind: string | null;
  title: string;
  blurb: string | null;
  url: string | null;
  cta: string | null;        // button label, e.g. "RSVP", "Apply", "Read the article"
  image_url: string | null;
  org: string | null;        // company, host or author
  detail: string | null;     // "10 hrs a month · Start now", "90 minutes · Free"
  starts_at: string | null;  // events
  place: string | null;      // events: "New York", "Online"
  price: string | null;      // events, education: "Free", "$25"
  featured: boolean;
  news: boolean;
  published: boolean;
  sort: number;
  source: string | null;     // "admin", or the feed it was suggested from
}

export const BE_KNOWN_URL = "https://beknownweekly.substack.com/";

export const TYPE_LABEL: Record<SpotlightType, string> = { hero: "Article", news: "News", featured: "Featured", event: "Event", opportunity: "Opportunity", education: "Education", community: "Community" };

/** Everything published, newest first. Used by the public page. */
export async function publishedSpotlight(): Promise<SpotlightItem[]> {
  const { data, error } = await createServerSupabase().from("spotlight_items").select("*").eq("published", true).order("sort", { ascending: true }).order("created_at", { ascending: false });
  if (error) { console.error("spotlight:", error.message); return []; }
  return (data || []) as SpotlightItem[];
}

const NY = "America/New_York";
export const eventDay = (iso: string) => ({ month: new Date(iso).toLocaleDateString("en-US", { month: "short", timeZone: NY }), day: new Date(iso).toLocaleDateString("en-US", { day: "2-digit", timeZone: NY }) });
export const eventWhen = (iso: string) => { const d = new Date(iso); return `${d.toLocaleDateString("en-US", { weekday: "short", timeZone: NY })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: NY })} ET`; };
export const ago = (iso: string) => { const h = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 36e5)); return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`; };
