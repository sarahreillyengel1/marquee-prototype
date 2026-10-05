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
  const needsPassword = !!(existing?.app_metadata as { needs_password?: boolean } | undefined)?.needs_password;
  const meta = (existing?.user_metadata || {}) as { first_name?: string; last_name?: string };
  return NextResponse.json({ email: p.email, plan: p.planLabel, hasAccount: !!existing && !needsPassword, needsPassword, claimed: !!p.claimedBy && !needsPassword, first: meta.first_name || "", last: meta.last_name || "" });
}
