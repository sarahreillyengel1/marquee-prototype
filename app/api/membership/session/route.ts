import { NextResponse } from "next/server";
import { paidSession, userByEmail } from "@/lib/membership-server";
import { stripeReady } from "@/lib/stripe";

// GET /api/membership/session?session_id=cs_… -> { email, plan, hasAccount, claimed }
// Used by /join/welcome straight after payment, to show whose membership this is.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!stripeReady()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = await paidSession(new URL(req.url).searchParams.get("session_id") || "");
  if (!p) return NextResponse.json({ error: "We couldn't find that payment." }, { status: 404 });
  const existing = await userByEmail(p.email);
  return NextResponse.json({ email: p.email, plan: p.planLabel, hasAccount: !!existing, claimed: !!p.claimedBy });
}
