import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { attachMembership, paidSession, userByEmail } from "@/lib/membership-server";
import { stripeReady } from "@/lib/stripe";

// POST /api/membership/claim { session_id, first_name, last_name, password } -> { ok, email, existing }
// Creates the account for a membership that has just been paid for. The email always comes
// from the payment itself, never from the form. If that email already has an account, the
// membership is added to it and the person is asked to sign in.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripeReady()) return NextResponse.json({ error: "Sign-up isn't switched on yet." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const p = await paidSession(String(body.session_id || ""));
  if (!p) return NextResponse.json({ error: "We couldn't find that payment." }, { status: 404 });

  const existing = await userByEmail(p.email);
  if (existing) {
    if (p.claimedBy && p.claimedBy !== existing.id) return NextResponse.json({ error: "This membership is already set up." }, { status: 409 });
    await attachMembership(existing.id, p);
    return NextResponse.json({ ok: true, email: p.email, existing: true });
  }
  if (p.claimedBy) return NextResponse.json({ error: "This membership is already set up." }, { status: 409 });

  const first = String(body.first_name || "").trim().slice(0, 60), last = String(body.last_name || "").trim().slice(0, 60);
  const password = String(body.password || "");
  if (!first || !last) return NextResponse.json({ error: "Please add your first and last name." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });

  const db = createServerSupabase();
  const { data, error } = await db.auth.admin.createUser({ email: p.email, password, email_confirm: true, user_metadata: { first_name: first, last_name: last, full_name: `${first} ${last}` } });
  if (error || !data.user) { console.error("Membership account error:", error?.message); return NextResponse.json({ error: "We couldn't create your account. Please try again." }, { status: 500 }); }
  await attachMembership(data.user.id, p);
  return NextResponse.json({ ok: true, email: p.email, existing: false });
}
