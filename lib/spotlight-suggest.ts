// Suggested events for Spotlight: read from Eventbrite's public search pages and from Luma calendars
// Sarah names, saved as unpublished items with source "eventbrite" or "luma" for her to approve or dismiss.
// Nothing reaches the page until she publishes it. Runs weekly (vercel.json) and from the editor.

import { createServerSupabase } from "@/lib/supabase";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

/** Eventbrite place slugs for the cities Sarah asked for, plus online. */
export const EVENTBRITE_PLACES: [string, string][] = [
  ["online", "Online"], ["ny--new-york", "New York"], ["ca--san-francisco", "San Francisco"], ["ca--los-angeles", "Los Angeles"],
  ["ma--boston", "Boston"], ["il--chicago", "Chicago"], ["tx--dallas", "Dallas"], ["pa--philadelphia", "Philadelphia"],
  ["tx--houston", "Houston"], ["ri--providence", "Providence"], ["ct--hartford", "Connecticut"], ["fl--miami", "Miami"], ["ga--atlanta", "Atlanta"],
];
/** Search terms, one page each per place. */
export const EVENTBRITE_TERMS = ["career", "executive-leadership", "fractional", "hiring"];
/** Luma calendars to read in full (the part of the address after lu.ma/). Sarah adds names here. */
export const LUMA_CALENDARS: string[] = [];

const RELEVANT = /\b(career|careers|résumé|resume|executive|executives|fractional|hiring|recruit|job search|jobs?\b|leadership|leaders|board (member|director|seat|readiness)|advisor|advisory|founder|operator|c-suite|cmo|cfo|coo|cro|chief|vp\b|networking|linkedin|personal brand|portfolio career|consult|freelance|interview|salary|negotiat|promotion|layoff|transition|pivot|women in|professional)/i;
const NOISE = /\b(kids|children|teen|students? only|college fair|yoga|dating|singles|crypto|nft|web3|hackathon|bootcamp for beginners|hiring event for drivers|warehouse|nursing|cdl)\b/i;

export type Suggestion = { title: string; url: string; starts_at: string; place: string; kind: "In person" | "Online"; org: string; price: string; blurb: string; image_url: string; source: string };

type LD = { "@type"?: string; name?: string; url?: string; startDate?: string; description?: string; image?: string | string[]; organizer?: { name?: string }; location?: { "@type"?: string; name?: string; address?: { addressLocality?: string; addressRegion?: string } }; offers?: { price?: string | number; lowPrice?: string | number; priceCurrency?: string }[] | { price?: string | number; lowPrice?: string | number }; eventAttendanceMode?: string; itemListElement?: { item?: LD }[] };

const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const price = (o: LD["offers"]) => {
  const arr = Array.isArray(o) ? o : o ? [o] : [];
  const vals = arr.map((x) => Number(x.lowPrice ?? x.price)).filter((n) => !isNaN(n));
  if (!vals.length) return "";
  const min = Math.min(...vals);
  return min === 0 ? "Free" : `From $${Math.round(min)}`;
};

function eventsFromLd(html: string): LD[] {
  const out: LD[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let d: unknown; try { d = JSON.parse(m[1]); } catch { continue; }
    const items = Array.isArray(d) ? d : [d];
    for (const it of items as LD[]) {
      if (it?.["@type"] === "Event") out.push(it);
      if (it?.["@type"] === "ItemList") for (const el of it.itemListElement || []) if (el.item?.["@type"] === "Event") out.push(el.item);
    }
  }
  return out;
}

async function get(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

/** Eventbrite: one search page per place × term. */
export async function eventbriteSuggestions(): Promise<Suggestion[]> {
  const out: Suggestion[] = [];
  const jobs = EVENTBRITE_PLACES.flatMap(([slug, city]) => EVENTBRITE_TERMS.map((term) => ({ slug, city, term })));
  for (let i = 0; i < jobs.length; i += 6) {
    await Promise.all(jobs.slice(i, i + 6).map(async ({ slug, city, term }) => {
      try {
        const html = await get(`https://www.eventbrite.com/d/${slug}/${term}/`);
        for (const e of eventsFromLd(html)) {
          const title = text(e.name || ""); const url = (e.url || "").split("?")[0];
          if (!title || !url || !e.startDate) continue;
          if (!RELEVANT.test(title) || NOISE.test(title)) continue;
          const online = slug === "online" || /Online/i.test(e.eventAttendanceMode || "") || /online|virtual/i.test(e.location?.name || "");
          const loc = e.location?.address ? [e.location.address.addressLocality, e.location.address.addressRegion].filter(Boolean).join(", ") : "";
          out.push({ title, url, starts_at: new Date(e.startDate).toISOString(), place: online ? "Online" : loc || city, kind: online ? "Online" : "In person", org: text(e.organizer?.name || ""), price: price(e.offers), blurb: text(e.description || "").slice(0, 160), image_url: Array.isArray(e.image) ? e.image[0] || "" : e.image || "", source: "eventbrite" });
        }
      } catch { /* one page failing shouldn't stop the rest */ }
    }));
  }
  return out;
}

/** Luma: every upcoming event on each named calendar, from the calendar page's embedded data. */
export async function lumaSuggestions(): Promise<Suggestion[]> {
  const out: Suggestion[] = [];
  for (const slug of LUMA_CALENDARS) {
    try {
      const html = await get(`https://lu.ma/${slug}`);
      const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!m) continue;
      const s = m[1];
      type LEv = { event: { name: string; start_at: string; url: string; location_type?: string; geo_address_info?: { city_state?: string } }; calendar?: { name?: string }; ticket_info?: { is_free?: boolean; price?: { cents?: number } }; cover_image?: { url?: string } };
      const found: LEv[] = [];
      const walk = (o: unknown) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") { const r = o as Record<string, unknown>; if (r.event && typeof r.event === "object" && (r.event as { start_at?: string }).start_at) found.push(r as unknown as LEv); else Object.values(r).forEach(walk); } };
      walk(JSON.parse(s));
      for (const x of found) {
        const ev = x.event; if (!ev?.name || !ev.url || !ev.start_at) continue;
        const online = ev.location_type === "online";
        out.push({ title: text(ev.name), url: `https://lu.ma/${ev.url}`, starts_at: new Date(ev.start_at).toISOString(), place: online ? "Online" : ev.geo_address_info?.city_state || "", kind: online ? "Online" : "In person", org: x.calendar?.name || "", price: x.ticket_info?.is_free ? "Free" : x.ticket_info?.price?.cents ? `$${Math.round(x.ticket_info.price.cents / 100)}` : "", blurb: "", image_url: x.cover_image?.url || "", source: "luma" });
      }
    } catch { /* skip this calendar */ }
  }
  return out;
}

/** Gather, drop what we've seen before (any status, including dismissed), save the rest as drafts. */
export async function refreshSuggestions() {
  const db = createServerSupabase();
  const [eb, lu] = await Promise.all([eventbriteSuggestions(), lumaSuggestions()]);
  const now = Date.now(), horizon = now + 75 * 864e5;
  const fresh = [...eb, ...lu].filter((s) => { const t = new Date(s.starts_at).getTime(); return t > now && t < horizon; });
  // one per url
  const byUrl = new Map<string, Suggestion>(); for (const s of fresh) if (!byUrl.has(s.url)) byUrl.set(s.url, s);
  const { data: known } = await db.from("spotlight_items").select("url").not("url", "is", null);
  const seen = new Set((known || []).map((k) => k.url));
  const rows = [...byUrl.values()].filter((s) => !seen.has(s.url)).map((s) => ({ type: "event", kind: s.kind, title: s.title.slice(0, 200), blurb: s.blurb || null, url: s.url, cta: "RSVP", image_url: s.image_url || null, org: s.org || null, detail: null, starts_at: s.starts_at, place: s.place || null, price: s.price || null, featured: false, news: false, published: false, sort: 0, source: s.source }));
  if (rows.length) { const { error } = await db.from("spotlight_items").insert(rows); if (error) throw new Error(error.message); }
  return { found: byUrl.size, added: rows.length, eventbrite: eb.length, luma: lu.length };
}
