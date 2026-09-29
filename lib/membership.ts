// Marquee membership — the two plans on the pricing page.
//
// Founding Member: open now, limited to the first 250, $20/month or $200/year. The price stays
//                  locked for as long as the membership stays active (Stripe keeps a subscriber
//                  on the price they joined at).
// Marquee Pro:     opens December 1, $29/month or $279/year. Until then people leave an email.

import type Stripe from "stripe";

export const FOUNDING_LIMIT = 250;
export const PRO_OPENS = "December 1";

export const PLANS = {
  founding_monthly: { label: "Founding Member, monthly", cents: 2000, interval: "month" as const, display: "$20/month" },
  founding_yearly: { label: "Founding Member, annual", cents: 20000, interval: "year" as const, display: "$200/year" },
};
// What the same billing will cost on Marquee Pro from December 1. Used to show the Founding Member saving.
export const PRO_CENTS = { founding_monthly: 2900, founding_yearly: 27900 } as const;
/** The Founding Member saving against Marquee Pro, like for like (monthly against monthly, annual against annual). */
export function foundingSaving(key: keyof typeof PLANS) {
  const pro = PRO_CENTS[key], cents = PLANS[key].cents;
  const perYear = (pro - cents) * (PLANS[key].interval === "month" ? 12 : 1);
  return { proDollars: pro / 100, percent: Math.round(((pro - cents) / pro) * 100), yearDollars: perYear / 100 };
}
export type PlanKey = keyof typeof PLANS;
export const isPlan = (k: unknown): k is PlanKey => k === "founding_monthly" || k === "founding_yearly";

const PRODUCT_NAME = "Marquee Founding Member";

/** The two Founding Member prices in Stripe. Created the first time they are needed, then reused. */
export async function foundingPrices(stripe: Stripe): Promise<Record<PlanKey, string>> {
  const found = await stripe.prices.list({ lookup_keys: Object.keys(PLANS), active: true, limit: 10 });
  const out = {} as Record<PlanKey, string>;
  for (const p of found.data) if (isPlan(p.lookup_key)) out[p.lookup_key] = p.id;
  if (out.founding_monthly && out.founding_yearly) return out;

  const products = await stripe.products.search({ query: `name:"${PRODUCT_NAME}" AND active:"true"`, limit: 1 }).catch(() => ({ data: [] as Stripe.Product[] }));
  const product = products.data[0] || (await stripe.products.create({ name: PRODUCT_NAME, description: "Full access to Marquee Pro at Founding Member pricing, locked while the membership stays active." }));
  for (const key of Object.keys(PLANS) as PlanKey[]) {
    if (out[key]) continue;
    const plan = PLANS[key];
    const price = await stripe.prices.create({ product: product.id, currency: "usd", unit_amount: plan.cents, recurring: { interval: plan.interval }, lookup_key: key, nickname: plan.label });
    out[key] = price.id;
  }
  return out;
}

/** How many Founding Members there are. Counted from live subscriptions, so it can't drift. */
export async function foundingCount(stripe: Stripe, prices: Record<PlanKey, string>): Promise<number> {
  let n = 0;
  for (const price of Object.values(prices)) {
    for await (const sub of stripe.subscriptions.list({ price, status: "all", limit: 100 })) {
      if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") n++;
      if (n >= FOUNDING_LIMIT) return n;
    }
  }
  return n;
}
