// Display helpers shared by the board card (client) and the listing page (server). No "use client" here on purpose:
// a server component cannot call functions that live in a client module.
import { REMOTE_LABEL, payLabel } from "@/lib/opportunities";
type Row = { location: string | null; remote: string | null; hours_per_week: number | null; start_text: string | null; length_text: string | null; work_type: string; pay_min: number | null; pay_max: number | null; pay_per: string | null; pay_note: string | null };

export const initials = (company: string) => company.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
const SMALL = new Set(["and", "or", "of", "the", "for", "to", "in", "on", "with", "a", "an"]);
/** "direct-response creative strategy" -> "Direct-Response Creative Strategy". Words already in caps (DTC, SaaS) stay. */
export const titleCase = (s: string) => s.trim().split(/\s+/).map((w, i) => (w === w.toUpperCase() || /[A-Z]/.test(w.slice(1)) ? w : (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.split("-").map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p)).join("-")))).join(" ");
export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Pay for the card: the numbers, or "Rate not listed" when the posting only says something like "to be discussed". */
export const cardPay = (j: Pick<Row, "pay_min" | "pay_max" | "pay_per" | "pay_note">) => {
  if (j.pay_min || j.pay_max) return payLabel(j);
  const note = (j.pay_note || "").trim();
  return note && note.length <= 16 ? cap(note) : "";
};

/** A short place, from however the posting wrote it: "US · Remote", "Global · Remote", "San Francisco, CA", "New York, NY". */
const CITIES: [RegExp, string][] = [
  [/san francisco|\bSF\b|bay area/i, "San Francisco, CA"], [/new york|\bNYC?\b|manhattan|brooklyn/i, "New York, NY"], [/los angeles|\bLA\b|santa monica/i, "Los Angeles, CA"],
  [/chicago/i, "Chicago, IL"], [/boston|cambridge, ma/i, "Boston, MA"], [/austin/i, "Austin, TX"], [/seattle/i, "Seattle, WA"], [/denver|boulder/i, "Denver, CO"], [/miami/i, "Miami, FL"],
  [/washington,? d\.?c\.?|\bDC\b/i, "Washington, DC"], [/atlanta/i, "Atlanta, GA"], [/philadelphia/i, "Philadelphia, PA"], [/raleigh|durham/i, "Raleigh, NC"], [/dallas/i, "Dallas, TX"], [/phoenix/i, "Phoenix, AZ"],
];
export const shortLocation = (loc: string | null): string => {
  const s = (loc || "").trim();
  if (!s) return "";
  const us = /\b(u\.?s\.?a?|united states|us-based|usa only)\b/i.test(s);
  if (/anywhere|worldwide|global/i.test(s)) return "Global · Remote";
  if (/remote/i.test(s) || /^(us|usa|usa only|united states)$/i.test(s)) return us ? "US · Remote" : s.length <= 22 ? s : "Remote";
  const hits = CITIES.filter(([re]) => re.test(s)).map(([, name]) => name);
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) return `${hits[0].split(",")[0]} or ${hits[1].split(",")[0]}`;
  if (/^[A-Z]{2}, ?US(A)?$/i.test(s)) return { CA: "California", NY: "New York", TX: "Texas", WA: "Washington", MA: "Massachusetts", IL: "Illinois", CO: "Colorado", FL: "Florida" }[s.slice(0, 2).toUpperCase()] || s.slice(0, 2).toUpperCase();
  if (s.length <= 24) return s.replace(/\bUnited States\b/i, "US").replace(/, US$/i, "");
  const first = s.split(/[,;(\u2013-]| or /)[0].trim();
  const state = s.match(/,\s*([A-Z]{2})\b/)?.[1];
  return state && first.length <= 18 ? `${first}, ${state}` : first.slice(0, 24);
};
/** The place tags: the short location, then Remote / Hybrid / On-site when the location does not already say it. */
export const placeTags = (j: Pick<Row, "location" | "remote">): string[] => {
  const loc = shortLocation(j.location);
  const r = j.remote && j.remote !== "unknown" ? REMOTE_LABEL[j.remote] : "";
  return [loc, r && !/remote/i.test(loc) && !loc.toLowerCase().includes(r.toLowerCase().replace("on-site", "site")) ? r : ""].filter(Boolean);
};
export const whereLabel = (j: Pick<Row, "location" | "remote">) => placeTags(j).join(" · ");
export const timeLabel = (j: Pick<Row, "hours_per_week" | "start_text" | "length_text" | "work_type">) => {
  const bits = [j.hours_per_week ? `${j.hours_per_week} hrs a week` : "", j.length_text ? cap(j.length_text) : "", j.start_text ? `Starts ${cap(j.start_text)}` : ""].filter(Boolean);
  if (!bits.length && j.work_type === "full-time") return "Full-time";
  return bits.slice(0, 2).join(" · ");
};

