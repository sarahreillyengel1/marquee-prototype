import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { originOf } from "@/lib/booking-server";
import { stripe, stripeReady } from "@/lib/stripe";

// Getting paid: each person connects their own Stripe account, on Stripe's own pages.
// GET  /api/stripe/connect -> { available, connected, ready }
// POST /api/stripe/connect -> { url }  the Stripe page to set up or finish the account
async function me() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return data.user;
}

export async function GET() {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!stripeReady()) return NextResponse.json({ available: false, connected: false, ready: false });
  const db = createServerSupabase();
  const { data } = await db.from("booking_settings").select("stripe_account_id,stripe_ready").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_account_id) return NextResponse.json({ available: true, connected: false, ready: false });
  try {
    const acct = await stripe().accounts.retrieve(data.stripe_account_id);
    const ready = !!acct.charges_enabled && !!acct.payouts_enabled;
    if (ready !== !!data.stripe_ready) await db.from("booking_settings").update({ stripe_ready: ready }).eq("user_id", user.id);
    return NextResponse.json({ available: true, connected: true, ready });
  } catch { return NextResponse.json({ available: true, connected: true, ready: false }); }
}

export async function POST(req: Request) {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!stripeReady()) return NextResponse.json({ error: "Payments aren't switched on for Marquee yet." }, { status: 503 });
  const db = createServerSupabase();
  const origin = originOf(req);
  try {
    const { data } = await db.from("booking_settings").select("stripe_account_id").eq("user_id", user.id).maybeSingle();
    let id = data?.stripe_account_id as string | undefined;
    if (!id) {
      const acct = await stripe().accounts.create({ type: "express", email: user.email || undefined, capabilities: { card_payments: { requested: true }, transfers: { requested: true } }, business_profile: { product_description: "Sessions booked through my Marquee profile" }, metadata: { marquee_user_id: user.id } });
      id = acct.id;
      await db.from("booking_settings").upsert({ user_id: user.id, stripe_account_id: id, stripe_ready: false }, { onConflict: "user_id" });
    }
    const link = await stripe().accountLinks.create({ account: id, type: "account_onboarding", refresh_url: `${origin}/build-preview?stripe=retry`, return_url: `${origin}/build-preview?stripe=done` });
    return NextResponse.json({ url: link.url });
  } catch (e) {
    console.error("Stripe connect error:", e);
    return NextResponse.json({ error: "Couldn't open Stripe. Please try again." }, { status: 502 });
  }
}
