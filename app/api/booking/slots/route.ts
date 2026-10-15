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
    const busy = await busyOf(db, username);
    let pick = offer;
    let days = computeSlots(s.settings, pick.durationMin, busy);
    // Nothing fits at this length, but a shorter one still does (a 60-minute slot gone, 20 minutes
    // left in the window): open on the length that has times, when the visitor did not ask for one.
    if (!days.length && !minutes && offer.sessions.length > 1) {
      for (const alt of [...offer.sessions].sort((a, b) => a.minutes - b.minutes)) {
        if (alt.minutes === offer.durationMin) continue;
        const d = computeSlots(s.settings, alt.minutes, busy);
        if (d.length) { pick = { ...offer, durationMin: alt.minutes, priceCents: alt.priceCents }; days = d; break; }
      }
    }
    // a priced offer is paid at booking only once the person has connected Stripe
    const payNow = pick.priceCents > 0 && stripeReady() && s.stripeReady && !!s.stripeAccount;
    return NextResponse.json({ open: days.length > 0, timezone: s.settings.timezone, durationMin: pick.durationMin, priceCents: pick.priceCents, payNow, sessions: offer.sessions, days });
  } catch { return NextResponse.json(closed); }
}
