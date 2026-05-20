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
