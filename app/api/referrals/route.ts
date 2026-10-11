import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase";
import { REFERRAL_CAP, REFERRAL_GOAL, referralCodeFor, referralLink, referralProgress, saveInvite } from "@/lib/referrals";
import { sendReferralInvite } from "@/lib/email";

// GET  /api/referrals                  -> the signed-in member's link and progress
// POST /api/referrals { name, email }  -> invite a friend: saved, then Marquee emails them in the member's name
export const dynamic = "force-dynamic";

async function me() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return data.user;
}

async function payload(userId: string, appMeta: Record<string, unknown> | undefined) {
  const code = await referralCodeFor(userId);
  let progress = { invited: 0, joined: 0, verified: 0, invites: [] as { name: string; email: string; at: string; joined: boolean }[] };
  try { progress = await referralProgress(userId); } catch { /* tables not there yet */ }
  return { code, link: referralLink(code), ...progress, goal: REFERRAL_GOAL, cap: REFERRAL_CAP, rewarded: !!appMeta?.referral_reward_at };
}

export async function GET() {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  return NextResponse.json(await payload(user.id, user.app_metadata));
}

export async function POST(req: Request) {
  const user = await me();
  if (!user || !user.email) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || ""), email = String(body.email || "");
  const problem = await saveInvite(user.id, user.email, name, email);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  // the member's name and public link for the email
  const meta = (user.user_metadata || {}) as { full_name?: string; first_name?: string };
  const memberName = (meta.full_name || meta.first_name || "").trim() || "A Marquee member";
  const { data: pub } = await createServerSupabase().from("published_profiles").select("username").eq("user_id", user.id).maybeSingle();
  const code = await referralCodeFor(user.id);
  await sendReferralInvite({ to: email.trim(), friendName: name.trim(), memberName, memberEmail: user.email, memberProfile: pub?.username ? `https://marquee.bio/${pub.username}` : "", link: referralLink(code) }).catch(() => null);
  return NextResponse.json({ ok: true, ...(await payload(user.id, user.app_metadata)) });
}
