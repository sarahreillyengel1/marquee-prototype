// Server-only: reading a paid checkout and attaching the membership to an account.
import type Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";
import { PLANS, isPlan, type PlanKey } from "@/lib/membership";
import { stripe } from "@/lib/stripe";

export interface PaidSession { email: string; plan: PlanKey; planLabel: string; customerId: string; subscriptionId: string; claimedBy: string }

/** A checkout that has really been paid, or null. */
export async function paidSession(sessionId: string): Promise<PaidSession | null> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  let s: Stripe.Checkout.Session;
  try { s = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] }); } catch { return null; }
  if (s.mode !== "subscription" || s.status !== "complete" || s.payment_status !== "paid") return null;
  const sub = s.subscription as Stripe.Subscription | null;
  const plan = s.metadata?.plan;
  const email = (s.customer_details?.email || s.customer_email || "").trim().toLowerCase();
  if (!sub || !isPlan(plan) || !email) return null;
  return { email, plan, planLabel: PLANS[plan].display, customerId: typeof s.customer === "string" ? s.customer : s.customer?.id || "", subscriptionId: sub.id, claimedBy: sub.metadata?.marquee_user_id || "" };
}

/** Record the membership on the person's account. Safe to run more than once. */
export async function attachMembership(userId: string, p: PaidSession, status = "active") {
  const db = createServerSupabase();
  const { data: u } = await db.auth.admin.getUserById(userId);
  await db.auth.admin.updateUserById(userId, { app_metadata: { ...(u.user?.app_metadata || {}), plan: p.plan, founding_member: true, subscription_status: status } });
  await db.from("profiles_meta").upsert({ id: userId, subscription_status: status, stripe_customer_id: p.customerId || null }, { onConflict: "id" });
  // extra columns exist once lib/membership-schema.sql has been run; without them this is skipped
  await db.from("profiles_meta").update({ plan: p.plan, founding_member: true, stripe_subscription_id: p.subscriptionId }).eq("id", userId).then(() => null, () => null);
  await stripe().subscriptions.update(p.subscriptionId, { metadata: { plan: p.plan, founding_member: "true", marquee_user_id: userId } });
}

/** Find an account by email (the admin list is small during the beta). */
export async function userByEmail(email: string) {
  const db = createServerSupabase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;
    const hit = data.users.find((x) => (x.email || "").toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}
