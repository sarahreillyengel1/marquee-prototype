import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { originOf } from "@/lib/booking-server";
import { FOUNDING_LIMIT, PLANS, foundingCount, foundingPrices, isPlan } from "@/lib/membership";
import { stripe, stripeReady } from "@/lib/stripe";

// POST /api/membership/checkout { plan: "founding_monthly" | "founding_yearly" } -> { url }
// Payment comes first; the account is created on the way back (see /join/welcome).
//   503 { notOpen: true }  payments aren't switched on yet
//   409 { full: true }     all 250 Founding Member places are taken
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan: unknown = body.plan;
  if (!isPlan(plan)) return NextResponse.json({ error: "Choose monthly or annual." }, { status: 400 });
  // who sent them, from marquee.bio/join?ref=<code>
  const ref = String(body.ref || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  const promo = String(body.promo || "").trim().toUpperCase().slice(0, 60);
  if (!stripeReady()) return NextResponse.json({ error: "Sign-up isn't switched on yet.", notOpen: true }, { status: 503 });
  try {
    const prices = await foundingPrices(stripe());
    if ((await foundingCount(stripe(), prices)) >= FOUNDING_LIMIT) return NextResponse.json({ error: "Founding Member places are all taken.", full: true }, { status: 409 });
    const origin = originOf(req);
    // a discount code carried from the sign-up page: apply it so nobody has to type it twice
    let promoId = "";
    // what we learned about the code, returned to the page so a wrong code can be explained instead of silently dropped
    let promoCheck: Record<string, unknown> | null = null;
    if (promo) {
      try {
        const found = await stripe().promotionCodes.list({ code: promo, limit: 1 });
        const pc = found.data[0];
        if (!pc) promoCheck = { found: false };
        else {
          // the library's typings moved the coupon around between versions; read it either way
          const raw = pc as unknown as { coupon?: string | Stripe.Coupon; promotion?: { coupon?: string | Stripe.Coupon } };
          const ref = raw.coupon ?? raw.promotion?.coupon;
          const c: Stripe.Coupon = typeof ref === "string" ? await stripe().coupons.retrieve(ref) : (ref as Stripe.Coupon);
          const r = pc.restrictions;
          promoCheck = { found: true, active: pc.active, expired: !!(pc.expires_at && pc.expires_at * 1000 < Date.now()), usedUp: !!(pc.max_redemptions && pc.times_redeemed >= pc.max_redemptions), customerOnly: !!pc.customer,
            firstTimeOnly: !!r?.first_time_transaction, minimum: r?.minimum_amount ? `${r.minimum_amount / 100} ${r.minimum_amount_currency}` : null,
            coupon: { valid: c.valid, off: c.amount_off ? `${c.amount_off / 100} ${c.currency}` : `${c.percent_off}%`, duration: c.duration, appliesToProducts: c.applies_to?.products || null } };
          if (pc.active && c.valid) promoId = pc.id;
        }
      } catch (e) { promoCheck = { error: e instanceof Error ? e.message.slice(0, 160) : "lookup failed" }; }
    }
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"], // cards confirm on the spot; bank transfers take days and need extra handling
      line_items: [{ price: prices[plan], quantity: 1 }],
      ...(promoId ? { discounts: [{ promotion_code: promoId }] } : { allow_promotion_codes: true }),
      subscription_data: { metadata: { plan, founding_member: "true" }, description: PLANS[plan].label },
      metadata: { plan, kind: "membership", ...(ref ? { ref } : {}) },
      success_url: `${origin}/join/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/join`,
    });
    return NextResponse.json({ url: session.url, promoApplied: !!promoId, ...(promoCheck ? { promoCheck } : {}) });
  } catch (e) {
    console.error("Membership checkout error:", e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
