// Server-only helpers for booking. Everything here runs with the service role, after the
// route has decided the caller is allowed to ask.
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { BLANK_SETTINGS, PENDING_HOLD_MIN, buildIcs, hasHours, money, parseMinutes, parsePriceCents, tidyRanges, whenLabel, type BookingSettings, type Busy, type Dates, type Range } from "@/lib/booking";
import type { BookingMail } from "@/lib/email";
import type { Profile } from "@/lib/profile-types";

export type Db = ReturnType<typeof createServerSupabase>;

export interface BookingRow {
  id: string; username: string; owner_id: string; kind: string; status: string; offer_title: string;
  starts_at: string | null; ends_at: string | null; visitor_timezone: string | null;
  visitor_name: string; visitor_email: string; visitor_note: string | null;
  price_cents: number; fee_cents: number; currency: string;
  stripe_session_id: string | null; stripe_payment_intent: string | null;
  manage_token: string; reminded_at: string | null; cancelled_at: string | null; created_at: string;
}

export async function currentUserId(): Promise<string | null> {
  try { const auth = await createSupabaseServer(); const { data } = await auth.auth.getUser(); return data.user?.id ?? null; } catch { return null; }
}

/** The published profile and its owner, by username. */
export async function ownerOf(db: Db, username: string) {
  const { data } = await db.from("published_profiles").select("user_id,username,profile").eq("username", username).maybeSingle();
  if (!data?.user_id) return null;
  const profile = data.profile as Profile;
  let email = profile.inquiryEmail || "";
  if (!email) { try { const { data: u } = await db.auth.admin.getUserById(data.user_id); email = u.user?.email || ""; } catch { /* no email on file */ } }
  return { ownerId: data.user_id as string, username: data.username as string, profile, name: profile.name || username, email };
}

/** One offer on a profile, with its length and price worked out. */
export function offerOf(profile: Profile, title: string, minutes?: number) {
  const e = (profile.engagements || []).find((x) => x.visible && x.title === title);
  if (!e) return null;
  const o = (profile.openTo || []).find((x) => x.label === title);
  // profiles published before session lengths existed have one length, read from the offer itself
  const sessions = e.sessions?.length ? e.sessions : [{ minutes: parseMinutes(o?.note), priceCents: e.rateDisplay === "show" ? parsePriceCents(e.price) : 0 }];
  // the length must be one the person actually offers; the price always comes from the profile, never the visitor
  const pick = minutes ? sessions.find((x) => x.minutes === minutes) : sessions[sessions.length - 1];
  if (!pick) return null;
  return { title: e.title, flow: e.flow, durationMin: pick.minutes, priceCents: pick.priceCents, sessions };
}

// Stored in the `weekly` column as { dates: { "2026-10-02": [{ start, end }] } }.
const cleanDates = (w: unknown): Dates => {
  const src = ((w && typeof w === "object" ? (w as { dates?: unknown }).dates : null) || {}) as Record<string, Range[]>;
  const out: Dates = {};
  for (const [d, list] of Object.entries(src)) { if (/^\d{4}-\d\d-\d\d$/.test(d) && Array.isArray(list)) { const t = tidyRanges(list); if (t.length) out[d] = t; } }
  return out;
};

export async function settingsOf(db: Db, ownerId: string) {
  const { data } = await db.from("booking_settings").select("*").eq("user_id", ownerId).maybeSingle();
  const s: BookingSettings = {
    timezone: data?.timezone || BLANK_SETTINGS.timezone, dates: cleanDates(data?.weekly), meeting_link: data?.meeting_link || "",
    notice_hours: data?.notice_hours ?? 2, buffer_min: data?.buffer_min ?? 0,
  };
  return { settings: s, open: hasHours(s.dates), stripeAccount: (data?.stripe_account_id as string) || "", stripeReady: !!data?.stripe_ready };
}

/** Times already taken: confirmed bookings, plus checkouts still inside their hold. */
export async function busyOf(db: Db, username: string): Promise<Busy[]> {
  const { data } = await db.from("bookings").select("starts_at,ends_at,status,created_at").eq("username", username).eq("kind", "booking").in("status", ["confirmed", "pending_payment"]).gte("ends_at", new Date().toISOString());
  const holdFrom = Date.now() - PENDING_HOLD_MIN * 60_000;
  return (data || []).filter((b) => b.status === "confirmed" || new Date(b.created_at).getTime() > holdFrom)
    .map((b) => ({ start: new Date(b.starts_at).getTime(), end: new Date(b.ends_at).getTime() }));
}

/** Everything the emails need, for one booking. */
export async function mailFor(db: Db, b: BookingRow, origin: string, cancelled = false): Promise<BookingMail | null> {
  const owner = await ownerOf(db, b.username);
  if (!owner || !owner.email || !b.starts_at || !b.ends_at) return null;
  const { settings } = await settingsOf(db, b.owner_id);
  const ics = buildIcs({
    id: b.id, title: `${b.offer_title}: ${b.visitor_name} and ${owner.name}`,
    description: [settings.meeting_link ? `Join: ${settings.meeting_link}` : "", b.visitor_note ? `Notes: ${b.visitor_note}` : "", `Manage: ${origin}/booking/${b.manage_token}`].filter(Boolean).join("\n"),
    location: settings.meeting_link, start: new Date(b.starts_at), end: new Date(b.ends_at),
    organizerName: owner.name, organizerEmail: owner.email, attendeeName: b.visitor_name, attendeeEmail: b.visitor_email, cancelled,
  });
  return {
    ownerName: owner.name, ownerEmail: owner.email, username: b.username,
    visitorName: b.visitor_name, visitorEmail: b.visitor_email, visitorNote: b.visitor_note,
    offerTitle: b.offer_title,
    whenForVisitor: whenLabel(b.starts_at, b.ends_at, b.visitor_timezone || settings.timezone),
    whenForOwner: whenLabel(b.starts_at, b.ends_at, settings.timezone),
    meetingLink: settings.meeting_link || undefined,
    paid: b.price_cents > 0 && b.stripe_payment_intent ? money(b.price_cents) : undefined,
    manageUrl: `${origin}/booking/${b.manage_token}`, ics,
  };
}

/** The site's own address, never a localhost value left over in settings. */
export const originOf = (req: Request) => { const o = new URL(req.url).origin; return /localhost|127\.0\.0\.1/.test(o) && process.env.NODE_ENV === "production" ? "https://marquee.bio" : o; };
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
