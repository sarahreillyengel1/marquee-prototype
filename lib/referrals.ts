// Referrals. Every member has a link (marquee.bio/join?ref=<code>) and can invite up to 10 friends by email
// from the builder; Marquee sends Sarah's invite in the member's name. A friend "joins" when their payment
// lands and counts toward the reward when Sarah verifies them. At 6 verified friends the member gets a
// one-time $20 credit on their Marquee bill (a Stripe customer-balance credit). Tables: lib/referrals-schema.sql.

import { createServerSupabase } from "@/lib/supabase";

export const REFERRAL_GOAL = 6;    // verified friends needed for the reward
export const REFERRAL_CAP = 10;    // invites per member
export const REWARD_CENTS = 2000;  // the one-time credit

/** The code in a member's link: their username when published, otherwise a short code from their account id. */
export async function referralCodeFor(userId: string): Promise<string> {
  const db = createServerSupabase();
  const { data } = await db.from("published_profiles").select("username").eq("user_id", userId).maybeSingle();
  return data?.username || `m-${userId.replace(/-/g, "").slice(0, 8)}`;
}

export const referralLink = (code: string) => `https://marquee.bio/join?ref=${encodeURIComponent(code)}`;

/** Who a ref code points at, or null. */
export async function referrerFor(code: string): Promise<string | null> {
  const c = (code || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!c) return null;
  const db = createServerSupabase();
  if (c.startsWith("m-")) {
    const stem = c.slice(2);
    if (stem.length < 8) return null;
    const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    return data?.users.find((u) => u.id.replace(/-/g, "").startsWith(stem))?.id || null;
  }
  const { data } = await db.from("published_profiles").select("user_id").eq("username", c).maybeSingle();
  return data?.user_id || null;
}

/** Record a paid referral once. Never credits someone for referring themselves. */
export async function recordReferral(code: string, referredId: string, referredEmail: string, sessionId: string) {
  const referrerId = await referrerFor(code);
  if (!referrerId || referrerId === referredId) return null;
  const db = createServerSupabase();
  const { data: dupe } = await db.from("referrals").select("id").eq("referred_id", referredId).maybeSingle();
  if (dupe) return null;
  const { error } = await db.from("referrals").insert({ referrer_id: referrerId, referred_id: referredId, referred_email: referredEmail, code, session_id: sessionId, paid_at: new Date().toISOString() });
  if (error) { console.error("referral:", error.message); return null; }
  return referrerId;
}

export type Progress = { invited: number; joined: number; verified: number; invites: { name: string; email: string; at: string; joined: boolean }[] };

/** A member's invites, who has joined (paid), and who Sarah has verified. */
export async function referralProgress(userId: string): Promise<Progress> {
  const db = createServerSupabase();
  const [{ data: inv }, { data: refs }] = await Promise.all([
    db.from("referral_invites").select("name,email,created_at").eq("referrer_id", userId).order("created_at", { ascending: true }),
    db.from("referrals").select("referred_id,referred_email").eq("referrer_id", userId).order("paid_at", { ascending: true }),
  ]);
  const joinedEmails = new Set((refs || []).map((r) => (r.referred_email || "").toLowerCase()));
  let verified = 0;
  for (const r of refs || []) {
    const { data } = await db.auth.admin.getUserById(r.referred_id);
    if ((data?.user?.app_metadata as { reviewed_at?: string } | undefined)?.reviewed_at) verified++;
  }
  return {
    invited: (inv || []).length, joined: (refs || []).length, verified,
    invites: (inv || []).map((i) => ({ name: i.name || "", email: i.email, at: i.created_at, joined: joinedEmails.has(i.email.toLowerCase()) })),
  };
}

/** Save an invite (cap 10, one per address, never yourself). Returns an error message or null. */
export async function saveInvite(userId: string, userEmail: string, name: string, email: string): Promise<string | null> {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email address.";
  if (e === userEmail.toLowerCase()) return "That's your own address.";
  const db = createServerSupabase();
  const { count } = await db.from("referral_invites").select("id", { count: "exact", head: true }).eq("referrer_id", userId);
  if ((count || 0) >= REFERRAL_CAP) return `You've invited ${REFERRAL_CAP} friends, the most the programme allows.`;
  const { data: dupe } = await db.from("referral_invites").select("id").eq("referrer_id", userId).eq("email", e).maybeSingle();
  if (dupe) return "You've already invited that address.";
  const { error } = await db.from("referral_invites").insert({ referrer_id: userId, name: name.trim().slice(0, 80) || null, email: e });
  if (error) { console.error("invite:", error.message); return "Couldn't save the invite. Please try again."; }
  return null;
}

/** After a member is verified: if someone referred them, and that brings the referrer to the goal, credit the referrer once. */
export async function grantReferralRewardIfDue(referredId: string): Promise<{ referrerId: string; credited: boolean; reached: boolean } | null> {
  const db = createServerSupabase();
  const { data: ref } = await db.from("referrals").select("referrer_id").eq("referred_id", referredId).maybeSingle();
  if (!ref) return null;
  const { data: u } = await db.auth.admin.getUserById(ref.referrer_id);
  const app = (u?.user?.app_metadata || {}) as Record<string, unknown>;
  if (app.referral_reward_at) return { referrerId: ref.referrer_id, credited: !!app.referral_reward_credited, reached: true };
  const { verified } = await referralProgress(ref.referrer_id);
  if (verified < REFERRAL_GOAL) return { referrerId: ref.referrer_id, credited: false, reached: false };
  const { data: meta } = await db.from("profiles_meta").select("stripe_customer_id").eq("id", ref.referrer_id).maybeSingle();
  let credited = false;
  if (meta?.stripe_customer_id) {
    const { stripe, stripeReady } = await import("@/lib/stripe");
    if (stripeReady()) {
      try { await stripe().customers.createBalanceTransaction(meta.stripe_customer_id, { amount: -REWARD_CENTS, currency: "usd", description: "Marquee referral reward: 6 friends joined and were verified" }); credited = true; }
      catch (e) { console.error("referral credit:", e); }
    }
  }
  // recorded either way, so /admin can show it and Sarah can apply the credit by hand if Stripe refused
  await db.auth.admin.updateUserById(ref.referrer_id, { app_metadata: { ...app, referral_reward_at: new Date().toISOString(), referral_reward_credited: credited } });
  return { referrerId: ref.referrer_id, credited, reached: true };
}
