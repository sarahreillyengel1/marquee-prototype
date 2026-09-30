import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export async function createCheckoutSession(
  email: string,
  userId: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboard/resume?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
    metadata: { user_id: userId },
  });

  return session.url!;
}

/* ── Booking payments (Stripe Connect) ──
   Each person connects their own Stripe account. A visitor pays at booking; the money goes
   to that person, and Marquee holds back 5% plus the card processing cost (2.9% + 30¢).
   Stripe charges Marquee for the card payment, so Marquee's own take is the 5%. */
export const stripeReady = () => { const k = process.env.STRIPE_SECRET_KEY || ""; return /^(sk|rk)_(test|live)_/.test(k) && !/placeholder/i.test(k); };
export const stripe = () => getStripe();

/* Stripe's newer accounts API (v2). New Connect platforms must create payout accounts this way.
   The Stripe library in this project predates it, so these calls go straight to Stripe. */
const V2_VERSION = "2026-08-26.preview";
export async function stripeV2<T = Record<string, unknown>>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const r = await fetch(`https://api.stripe.com${path}`, {
    method, cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Stripe-Version": V2_VERSION, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const j = (await r.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
  if (!r.ok) throw new Error(`Stripe ${r.status}: ${j.error?.code || ""} ${j.error?.message || "request failed"}`.slice(0, 400));
  return j as T;
}
type V2Account = { id: string; configuration?: { recipient?: { capabilities?: { stripe_balance?: { stripe_transfers?: { status?: string } } } } } };
/** A payout account for one person: they receive money Marquee passes on; Marquee is the seller of record. */
export const createPayoutAccount = (email: string | undefined, name: string, userId: string) =>
  stripeV2<V2Account>("POST", "/v2/core/accounts", {
    ...(email ? { contact_email: email } : {}),
    display_name: name.slice(0, 100) || "Marquee member",
    dashboard: "express",
    identity: { country: "us" },
    defaults: { responsibilities: { fees_collector: "application", losses_collector: "application" } },
    configuration: { recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } } },
    metadata: { marquee_user_id: userId },
  });
/** Can this person be paid yet? True once Stripe has everything it needs from them. */
export async function payoutAccountReady(id: string): Promise<boolean> {
  const a = await stripeV2<V2Account>("GET", `/v2/core/accounts/${encodeURIComponent(id)}?include=configuration.recipient`);
  return a.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";
}
/** The one-time Stripe page where the person enters (or finishes) their details. */
export const payoutOnboardingLink = (id: string, returnUrl: string, refreshUrl: string) =>
  stripeV2<{ url: string }>("POST", "/v2/core/account_links", { account: id, use_case: { type: "account_onboarding", account_onboarding: { configurations: ["recipient"], return_url: returnUrl, refresh_url: refreshUrl } } });
