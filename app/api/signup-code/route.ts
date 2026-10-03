import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { sendBetaWelcome } from "@/lib/email";

// POST /api/signup-code { code, email, password, first_name, last_name } -> { ok }
// Creates the account for someone joining with an invite code. The account is made here, already
// confirmed, so the only email the person gets is Marquee's own welcome.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const first = String(body.first_name || "").trim().slice(0, 60), last = String(body.last_name || "").trim().slice(0, 60);
  if (!code) return NextResponse.json({ error: "Enter your invite code." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!first || !last) return NextResponse.json({ error: "Please add your first and last name." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });

  const db = createServerSupabase();
  const { data: row } = await db.from("beta_codes").select("code,redeemed_at").eq("code", code).maybeSingle();
  if (!row) return NextResponse.json({ error: "That code isn't valid. Need one? Join the waitlist." }, { status: 400 });
  if (row.redeemed_at) return NextResponse.json({ error: "That code has already been used." }, { status: 400 });

  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: first, last_name: last, full_name: `${first} ${last}` },
    // everyone in the beta is a Founding Member; invite-code members are not billed
    app_metadata: { founding_member: true, plan: "founding_comped", subscription_status: "active", granted_by: `invite code ${code}` } });
  if (error || !data.user) {
    const taken = /already|registered|exists/i.test(error?.message || "");
    if (!taken) console.error("Invite signup error:", error?.message);
    return NextResponse.json({ error: taken ? "That email already has an account. Sign in instead." : "We couldn't create your account. Please try again." }, { status: taken ? 409 : 500 });
  }

  // Claim the code only if it is still unused; if someone else took it in the meantime, undo the account.
  const { data: claimed } = await db.from("beta_codes").update({ redeemed_at: new Date().toISOString(), redeemed_by: data.user.id }).eq("code", code).is("redeemed_at", null).select("code");
  if (!claimed?.length) {
    await db.auth.admin.deleteUser(data.user.id).catch(() => null);
    return NextResponse.json({ error: "That code has already been used." }, { status: 400 });
  }
  await db.from("profiles_meta").upsert({ id: data.user.id, subscription_status: "beta", beta_code_used: code });
  await sendBetaWelcome(email, first).catch(() => null);
  return NextResponse.json({ ok: true });
}
