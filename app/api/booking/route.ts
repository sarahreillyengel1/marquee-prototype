import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { computeSlots, feeCents, validTz } from "@/lib/booking";
import { busyOf, currentUserId, mailFor, offerOf, originOf, ownerOf, settingsOf, validEmail, type BookingRow } from "@/lib/booking-server";
import { emailReady, sendBookingConfirmed } from "@/lib/email";
import { stripe, stripeReady } from "@/lib/stripe";

// POST /api/booking { username, offer, minutes, start, name, email, note, timezone }
//   -> { ok, status: "confirmed", manageUrl, emailed }        free, or payments not connected
//   -> { ok, status: "pending_payment", checkoutUrl }         priced and payments connected
// GET  /api/booking  (signed in) -> the owner's own upcoming bookings and recent requests
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const title = String(body.offer || "").trim();
  const start = String(body.start || "");
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const note = String(body.note || "").trim().slice(0, 2000);
  const tz = validTz(body.timezone) ? String(body.timezone) : null;
  const minutes = Number(body.minutes) || undefined;
  if (!username || !title || !start || !name || !validEmail(email)) return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });

  const db = createServerSupabase();
  const owner = await ownerOf(db, username);
  const offer = owner && offerOf(owner.profile, title, minutes);
  if (!owner || !offer) return NextResponse.json({ error: "That offer isn't available." }, { status: 404 });
  const s = await settingsOf(db, owner.ownerId);

  // the time must be one we are actually offering right now
  const startMs = new Date(start).getTime();
  const offered = computeSlots(s.settings, offer.durationMin, await busyOf(db, username)).some((d) => d.slots.some((x) => new Date(x).getTime() === startMs));
  if (!s.open || !offered) return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });

  const payNow = offer.priceCents > 0 && stripeReady() && s.stripeReady && !!s.stripeAccount;
  const origin = originOf(req);
  const { data: row, error } = await db.from("bookings").insert({
    username, owner_id: owner.ownerId, kind: "booking", status: payNow ? "pending_payment" : "confirmed", offer_title: offer.title,
    starts_at: new Date(startMs).toISOString(), ends_at: new Date(startMs + offer.durationMin * 60_000).toISOString(), visitor_timezone: tz,
    visitor_name: name, visitor_email: email, visitor_note: note || null,
    price_cents: offer.priceCents, fee_cents: payNow ? feeCents(offer.priceCents) : 0,
  }).select("*").single();
  if (error || !row) return NextResponse.json({ error: error?.code === "23505" ? "That time was just taken. Please pick another." : "Couldn't save the booking. Please try again." }, { status: error?.code === "23505" ? 409 : 500 });
  const b = row as BookingRow;

  if (payNow) {
    try {
      const session = await stripe().checkout.sessions.create({
        mode: "payment", customer_email: email,
        payment_method_types: ["card"], // cards confirm on the spot, so the time is only held for someone who has paid
        line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: offer.priceCents, product_data: { name: `${offer.title} with ${owner.name}`, description: `${offer.durationMin} minutes` } } }],
        payment_intent_data: { application_fee_amount: b.fee_cents, transfer_data: { destination: s.stripeAccount }, metadata: { booking_id: b.id } },
        metadata: { booking_id: b.id }, expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        success_url: `${origin}/booking/${b.manage_token}?booked=1`, cancel_url: `${origin}/${username}#work-with-me`,
      });
      await db.from("bookings").update({ stripe_session_id: session.id }).eq("id", b.id);
      return NextResponse.json({ ok: true, status: "pending_payment", checkoutUrl: session.url });
    } catch (e) {
      console.error("Booking checkout error:", e);
      await db.from("bookings").delete().eq("id", b.id);
      return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
    }
  }

  const mail = await mailFor(db, b, origin);
  const sent = mail ? await sendBookingConfirmed(mail) : null;
  return NextResponse.json({ ok: true, status: "confirmed", manageUrl: `${origin}/booking/${b.manage_token}`, emailed: emailReady() && !!sent });
}

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = createServerSupabase();
  const since = new Date(Date.now() - 2 * 3600_000).toISOString();
  const [{ data: upcoming }, { data: requests }] = await Promise.all([
    db.from("bookings").select("id,offer_title,starts_at,ends_at,visitor_name,visitor_email,visitor_note,status,price_cents").eq("owner_id", me).eq("kind", "booking").eq("status", "confirmed").gte("starts_at", since).order("starts_at").limit(50),
    db.from("bookings").select("id,offer_title,visitor_name,visitor_email,visitor_note,created_at").eq("owner_id", me).eq("kind", "request").order("created_at", { ascending: false }).limit(20),
  ]);
  return NextResponse.json({ upcoming: upcoming || [], requests: requests || [] });
}
