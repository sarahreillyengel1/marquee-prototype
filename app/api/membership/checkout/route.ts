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
  if (!stripeReady()) return NextResponse.json({ error: "Sign-up isn't switched on yet.", notOpen: true }, { status: 503 });
  try {
    const prices = await foundingPrices(stripe());
    if ((await foundingCount(stripe(), prices)) >= FOUNDING_LIMIT) return NextResponse.json({ error: "Founding Member places are all taken.", full: true }, { status: 409 });
    const origin = originOf(req);
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"], // cards confirm on the spot; bank transfers take days and need extra handling
      line_items: [{ price: prices[plan], quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: { metadata: { plan, founding_member: "true" }, description: PLANS[plan].label },
      metadata: { plan, kind: "membership" },
      success_url: `${origin}/join/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/join`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Membership checkout error:", e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
