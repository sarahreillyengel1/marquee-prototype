import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { stripe, stripeReady } from "@/lib/stripe";

// POST /api/code-check { code } -> { promo } for a Stripe discount code, { legacy: true } for an old free invite code, or an error.
// Nothing is created or claimed here; the join page uses it to decide where the code takes you.
export const dynamic = "force-dynamic";

const WRONG = "That code doesn't match our records. Check for typos and try again, or email hello@marquee.bio.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase().slice(0, 60);
  if (!code) return NextResponse.json({ error: "Enter your code." }, { status: 400 });

  if (stripeReady()) {
    try {
      const found = await stripe().promotionCodes.list({ code, limit: 1 });
      const pc = found.data[0];
      if (pc) {
        const expired = !!(pc.expires_at && pc.expires_at * 1000 < Date.now());
        const usedUp = !!(pc.max_redemptions && pc.times_redeemed >= pc.max_redemptions);
        if (pc.active && !expired && !usedUp) return NextResponse.json({ promo: pc.code });
        return NextResponse.json({ error: usedUp ? "That code has been used up. Email hello@marquee.bio and we'll sort it out." : "That code has expired. Email hello@marquee.bio and we'll sort it out." }, { status: 400 });
      }
    } catch (e) { console.error("Code check:", e instanceof Error ? e.message : e); }
  }
  // the older free invite codes still work, on the sign-up page
  const { data: row } = await createServerSupabase().from("beta_codes").select("code,redeemed_at").eq("code", code).maybeSingle();
  if (row && !row.redeemed_at) return NextResponse.json({ legacy: true });
  if (row) return NextResponse.json({ error: "That code has already been used." }, { status: 400 });
  return NextResponse.json({ error: WRONG }, { status: 400 });
}
