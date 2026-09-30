import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";
import { mailFor, originOf, type BookingRow } from "@/lib/booking-server";
import { sendBookingConfirmed, sendMembershipWelcome } from "@/lib/email";
import { PLANS, isPlan } from "@/lib/membership";
import { payoutAccountReady, stripe, stripeReady } from "@/lib/stripe";

// Stripe tells us here when a booking has been paid (or the checkout was abandoned).
// Set this URL in Stripe: https://marquee.bio/api/stripe/webhook
// Events: checkout.session.completed, checkout.session.expired, account.updated,
//         customer.subscription.updated, customer.subscription.deleted
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim(); // a pasted secret often carries a stray space or line break
  if (!stripeReady() || !secret || /placeholder/i.test(secret)) return NextResponse.json({ error: "Payments aren't configured." }, { status: 503 });
  let event: Stripe.Event;
  try { event = stripe().webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") || "", secret); }
  catch (e) {
    // say why, without ever printing the secret itself
    console.error("Stripe webhook refused:", e instanceof Error ? e.message.slice(0, 200) : "unknown", "| secret looks like a signing secret:", secret.startsWith("whsec_"), "| length:", secret.length, "| signed:", !!req.headers.get("stripe-signature"));
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const db = createServerSupabase();
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const id = s.metadata?.booking_id;
    // a new member: email them the link to finish, in case they closed the page after paying
    if (s.metadata?.kind === "membership" && s.payment_status === "paid" && isPlan(s.metadata.plan)) {
      const to = s.customer_details?.email || s.customer_email;
      if (to) await sendMembershipWelcome(to, PLANS[s.metadata.plan].display, `${originOf(req)}/join/welcome?session_id=${s.id}`);
    }
    if (id && s.payment_status === "paid") {
      // only the first delivery confirms and emails; repeats find nothing left to update
      const { data } = await db.from("bookings").update({ status: "confirmed", stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id || null })
        .eq("id", id).eq("status", "pending_payment").select("*");
      const b = (data || [])[0] as BookingRow | undefined;
      if (b) { const mail = await mailFor(db, b, originOf(req)); if (mail) await sendBookingConfirmed(mail); }
    }
  } else if (event.type === "checkout.session.expired") {
    const id = (event.data.object as Stripe.Checkout.Session).metadata?.booking_id;
    if (id) await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancelled_by: "unpaid" }).eq("id", id).eq("status", "pending_payment");
  } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    // keep each member's status in step with Stripe (active, past_due, canceled…)
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.marquee_user_id;
    if (userId) {
      const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;
      await db.from("profiles_meta").update({ subscription_status: status }).eq("id", userId);
      const { data: u } = await db.auth.admin.getUserById(userId);
      if (u.user) await db.auth.admin.updateUserById(userId, { app_metadata: { ...(u.user.app_metadata || {}), subscription_status: status } });
    }
  } else if (event.type === "account.updated") {
    // payout accounts are checked with Stripe's newer API, so ask Stripe rather than trust this older message's fields
    const a = event.data.object as Stripe.Account;
    try { await db.from("booking_settings").update({ stripe_ready: await payoutAccountReady(a.id) }).eq("stripe_account_id", a.id); } catch (e) { console.error("Payout status check failed:", e); }
  }
  return NextResponse.json({ received: true });
}
