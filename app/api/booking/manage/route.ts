import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { money, whenLabel } from "@/lib/booking";
import { currentUserId, mailFor, originOf, ownerOf, settingsOf, type BookingRow } from "@/lib/booking-server";
import { sendBookingCancelled } from "@/lib/email";
import { stripe, stripeReady } from "@/lib/stripe";

const FREE_CANCEL_HOURS = 24; // cancel this long before the session for a full refund

// GET  /api/booking/manage?token=…            -> the booking, for the visitor's manage page
// POST /api/booking/manage { token }          -> visitor cancels
// POST /api/booking/manage { id } (signed in) -> the owner cancels their own booking
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (token.length < 20) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = createServerSupabase();
  const { data } = await db.from("bookings").select("*").eq("manage_token", token).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = data as BookingRow;
  const owner = await ownerOf(db, b.username);
  const { settings } = await settingsOf(db, b.owner_id);
  const hoursAway = b.starts_at ? (new Date(b.starts_at).getTime() - Date.now()) / 3600_000 : 0;
  return NextResponse.json({
    status: b.status, offer: b.offer_title, with: owner?.name || b.username, username: b.username, visitorName: b.visitor_name,
    when: b.starts_at && b.ends_at ? whenLabel(b.starts_at, b.ends_at, b.visitor_timezone || settings.timezone) : "",
    // the link is only shown to someone who holds a confirmed booking
    meetingLink: b.status === "confirmed" ? settings.meeting_link : "",
    paid: b.price_cents > 0 && b.stripe_payment_intent ? money(b.price_cents) : "",
    canCancel: b.status === "confirmed" && hoursAway > 0, refundIfCancelled: hoursAway >= FREE_CANCEL_HOURS, freeCancelHours: FREE_CANCEL_HOURS,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const db = createServerSupabase();
  let b: BookingRow | null = null; let by: "visitor" | "owner" = "visitor";
  if (body.token) { const { data } = await db.from("bookings").select("*").eq("manage_token", String(body.token)).maybeSingle(); b = data as BookingRow | null; }
  else if (body.id) {
    const me = await currentUserId();
    if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { data } = await db.from("bookings").select("*").eq("id", String(body.id)).eq("owner_id", me).maybeSingle(); b = data as BookingRow | null; by = "owner";
  }
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (b.status !== "confirmed") return NextResponse.json({ error: "This booking is no longer active." }, { status: 409 });
  if (!b.starts_at || new Date(b.starts_at).getTime() <= Date.now()) return NextResponse.json({ error: "This session has already started." }, { status: 409 });

  // the owner cancelling always refunds; the visitor is refunded when they give enough notice
  const hoursAway = (new Date(b.starts_at).getTime() - Date.now()) / 3600_000;
  let refunded = "";
  if (b.stripe_payment_intent && stripeReady() && (by === "owner" || hoursAway >= FREE_CANCEL_HOURS)) {
    try { await stripe().refunds.create({ payment_intent: b.stripe_payment_intent, reverse_transfer: true, refund_application_fee: true }); refunded = money(b.price_cents); }
    catch (e) { console.error("Refund error:", e); return NextResponse.json({ error: "Couldn't refund the payment, so the booking was not cancelled. Please try again." }, { status: 502 }); }
  }
  await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancelled_by: by }).eq("id", b.id);
  const mail = await mailFor(db, b, originOf(req), true);
  if (mail) await sendBookingCancelled({ ...mail, cancelledBy: by, refunded: refunded || undefined });
  return NextResponse.json({ ok: true, refunded });
}
