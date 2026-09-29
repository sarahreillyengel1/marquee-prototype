import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { computeSlots } from "@/lib/booking";
import { busyOf, offerOf, ownerOf, settingsOf } from "@/lib/booking-server";
import { stripeReady } from "@/lib/stripe";

// GET /api/booking/slots?username=x&offer=Office%20Hours[&minutes=20]
// -> { open, timezone, durationMin, priceCents, payNow, sessions: [{ minutes, priceCents }], days: [{ date, slots: [iso] }] }
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") || "").trim().toLowerCase();
  const title = (url.searchParams.get("offer") || "").trim();
  const minutes = Number(url.searchParams.get("minutes")) || undefined;
  const closed = { open: false, days: [] };
  if (!username || !title) return NextResponse.json(closed);
  try {
    const db = createServerSupabase();
    const owner = await ownerOf(db, username);
    const offer = owner && offerOf(owner.profile, title, minutes);
    if (!owner || !offer) return NextResponse.json(closed);
    const s = await settingsOf(db, owner.ownerId);
    if (!s.open) return NextResponse.json(closed);
    const days = computeSlots(s.settings, offer.durationMin, await busyOf(db, username));
    // a priced offer is paid at booking only once the person has connected Stripe
    const payNow = offer.priceCents > 0 && stripeReady() && s.stripeReady && !!s.stripeAccount;
    return NextResponse.json({ open: days.length > 0, timezone: s.settings.timezone, durationMin: offer.durationMin, priceCents: offer.priceCents, payNow, sessions: offer.sessions, days });
  } catch { return NextResponse.json(closed); }
}
