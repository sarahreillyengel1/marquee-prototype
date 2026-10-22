import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// POST /api/settings/billing -> a Stripe billing page for the member's own subscription (card, invoices, cancel)
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await createSupabaseServer();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Billing isn't available right now." }, { status: 503 });
  const db = createServerSupabase();
  const { data: meta } = await db.from("profiles_meta").select("stripe_customer_id,stripe_subscription_id").eq("id", user.id).maybeSingle();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let customer = meta?.stripe_customer_id || "";
  if (!customer && meta?.stripe_subscription_id) {
    try { const sub = await stripe.subscriptions.retrieve(meta.stripe_subscription_id); customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id; } catch { /* no subscription */ }
  }
  if (!customer && user.email) {
    try { const found = await stripe.customers.list({ email: user.email, limit: 1 }); customer = found.data[0]?.id || ""; } catch { /* none */ }
  }
  if (!customer) return NextResponse.json({ error: "There is no billing on file for this account." }, { status: 404 });
  const session = await stripe.billingPortal.sessions.create({ customer, return_url: "https://marquee.bio/settings" });
  return NextResponse.json({ url: session.url });
}
