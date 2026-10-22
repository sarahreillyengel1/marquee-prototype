import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { stripe, stripeReady } from "@/lib/stripe";
import { ensureMemberAccount, paidSession } from "@/lib/membership-server";
import { grantReferralRewardIfDue } from "@/lib/referrals";

// GET /api/admin/members -> everyone who has signed up, for the Marquee team only.
// Members (accounts, plan, profile), the waitlist, and December 1 reminders.
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

export async function GET() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  const email = (data.user?.email || "").toLowerCase();
  if (!email || !ADMINS.includes(email)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = createServerSupabase();
  const [{ data: users }, { data: profiles }, { data: waitlist }, { data: codes }, { data: drafts }, { data: payouts }, { data: invites }, { data: referrals }, { data: memberViews }] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    db.from("published_profiles").select("username,user_id,published_at"),
    db.from("waitlist").select("email,first_name,last_name,status,notes,linkedin_url,created_at").order("created_at", { ascending: false }),
    db.from("beta_codes").select("code,redeemed_at,redeemed_by"),
    db.from("builder_drafts").select("user_id,updated_at,data"),
    db.from("booking_settings").select("user_id,stripe_ready,meeting_link"),
    db.from("referral_invites").select("referrer_id").then((r) => (r.error ? { data: [] as { referrer_id: string }[] } : r)),
    db.from("referrals").select("referrer_id,referred_id,referred_email,paid_at,code").order("paid_at", { ascending: false }).then((r) => (r.error ? { data: [] as { referrer_id: string; referred_id: string; referred_email: string | null; paid_at: string | null; code: string | null }[] } : r)),
    db.from("page_views").select("member,at,path").not("member", "is", null).gte("at", new Date(Date.now() - 30 * 864e5).toISOString()).limit(50000).then((r) => (r.error ? { data: [] as { member: string; at: string; path: string }[] } : r)),
  ]);
  // how far each member's profile is: which of the main sections hold anything
  type DraftData = { photoUrl?: string; bio?: string; entries?: unknown[]; skills?: unknown[]; offers?: { added?: boolean }[]; media?: unknown[]; vals?: unknown[]; testis?: unknown[]; actions?: unknown[]; products?: unknown[] };
  const draftBy = new Map((drafts || []).map((d) => [d.user_id, d]));
  const payoutBy = new Map((payouts || []).map((b) => [b.user_id, b]));
  const NYday = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const daysBy = new Map<string, Set<string>>(); const lastBy = new Map<string, string>(); const builderBy = new Map<string, number>();
  for (const v of (memberViews || []) as { member: string; at: string; path: string }[]) {
    if (!daysBy.has(v.member)) daysBy.set(v.member, new Set());
    daysBy.get(v.member)!.add(NYday(v.at));
    if (!lastBy.has(v.member) || v.at > lastBy.get(v.member)!) lastBy.set(v.member, v.at);
    if (v.path.startsWith("/build-preview")) builderBy.set(v.member, (builderBy.get(v.member) || 0) + 1);
  }
  const reviewedIds = new Set((users?.users || []).filter((u) => ((u.app_metadata || {}) as { reviewed_at?: string }).reviewed_at).map((u) => u.id));
  const refJoined = new Map<string, number>(), refVerified = new Map<string, number>(), refInvited = new Map<string, number>();
  for (const r of (referrals || [])) {
    refJoined.set(r.referrer_id, (refJoined.get(r.referrer_id) || 0) + 1);
    if (reviewedIds.has(r.referred_id)) refVerified.set(r.referrer_id, (refVerified.get(r.referrer_id) || 0) + 1);
  }
  for (const i of (invites || [])) refInvited.set(i.referrer_id, (refInvited.get(i.referrer_id) || 0) + 1);
  const progress = (uid: string) => {
    const d = (draftBy.get(uid)?.data || {}) as DraftData;
    const checks = { photo: !!d.photoUrl, bio: !!(d.bio || "").trim(), experience: (d.entries?.length ?? 0) > 0, skills: (d.skills?.length ?? 0) > 0, offers: !!d.offers?.some((o) => o.added), media: (d.media?.length ?? 0) > 0, values: (d.vals?.length ?? 0) > 0, testimonials: (d.testis?.length ?? 0) > 0, ctas: (d.actions?.length ?? 0) > 0 };
    const done = Object.values(checks).filter(Boolean).length;
    return { pct: Math.round((done / Object.keys(checks).length) * 100), filled: Object.entries(checks).filter(([, v]) => v).map(([k]) => k) };
  };
  const byUser = new Map((profiles || []).map((p) => [p.user_id, p]));
  const codeBy = new Map((codes || []).filter((c) => c.redeemed_by).map((c) => [c.redeemed_by, c.code]));
  // what Stripe knows: the promotion code typed at checkout (MARQUEE-BETA, MARQUEE-MEGAN…), and whether the first month is free
  const { data: metas } = await db.from("profiles_meta").select("id,stripe_customer_id").not("stripe_customer_id", "is", null);
  const stripeBy = new Map<string, { code: string; trialEnd: string | null; status: string }>();
  if (stripeReady() && metas?.length) {
    await Promise.all(metas.map(async (m) => {
      try {
        const subs = await stripe().subscriptions.list({ customer: m.stripe_customer_id as string, status: "all", limit: 1, expand: ["data.discounts.promotion_code"] });
        const sub = subs.data[0]; if (!sub) return;
        const d = ((sub as unknown as { discounts?: unknown[] }).discounts?.[0] ?? (sub as unknown as { discount?: unknown }).discount) as { promotion_code?: { code?: string } | string | null; coupon?: { name?: string } } | null | undefined;
        const code = (d && typeof d === "object" && typeof d.promotion_code === "object" && d.promotion_code?.code) || (d && typeof d === "object" && d.coupon?.name) || "";
        stripeBy.set(m.id, { code, trialEnd: sub.trial_end && sub.trial_end * 1000 > Date.now() ? new Date(sub.trial_end * 1000).toISOString() : null, status: sub.status });
      } catch { /* no subscription */ }
    }));
  }
  const members = (users?.users || []).map((u) => {
    const m = (u.app_metadata || {}) as { plan?: string; founding_member?: boolean; subscription_status?: string; verified?: boolean; reviewed_at?: string; removed_at?: string; needs_password?: boolean; referral_reward_at?: string; referral_reward_credited?: boolean };
    const meta = (u.user_metadata || {}) as { full_name?: string };
    const p = byUser.get(u.id);
    return {
      id: u.id, reviewedAt: m.reviewed_at || "", removedAt: m.removed_at || "", needsPassword: !!m.needs_password,
      draftAt: draftBy.get(u.id)?.updated_at || "", progress: progress(u.id).pct, filled: progress(u.id).filled, payoutReady: !!payoutBy.get(u.id)?.stripe_ready, meetingLink: !!payoutBy.get(u.id)?.meeting_link,
      referrals: refJoined.get(u.id) || 0, referralsVerified: refVerified.get(u.id) || 0, referralsInvited: refInvited.get(u.id) || 0, rewardAt: m.referral_reward_at || "", rewardCredited: !!m.referral_reward_credited,
      activeDays: daysBy.get(u.id)?.size || 0, lastActive: lastBy.get(u.id) || u.last_sign_in_at || "", builderVisits: builderBy.get(u.id) || 0, isAdmin: ADMINS.includes((u.email || "").toLowerCase()),
      name: meta.full_name || "", email: u.email || "", joined: u.created_at, lastSeen: u.last_sign_in_at || "",
      plan: m.plan || (codeBy.get(u.id) ? "invite code" : ""), status: m.subscription_status || "", founding: !!m.founding_member, verified: !!m.verified,
      code: codeBy.get(u.id) || stripeBy.get(u.id)?.code || "", freeUntil: stripeBy.get(u.id)?.trialEnd || "", username: p?.username || "", publishedAt: p?.published_at || "",
    };
  }).sort((a, b) => b.joined.localeCompare(a.joined));
  const wl = waitlist || [];

  // Site visits for the last 30 days. Null until the page_views table exists.
  type PV = { at: string; path: string; profile: string | null; ref: string | null; device: string | null; visitor: string | null };
  let traffic: unknown = null;
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: pv, error: pvErr } = await db.from("page_views").select("at,path,profile,ref,device,visitor,member").gte("at", since).order("at", { ascending: false }).limit(50000);
  let automated = { visitors: 0, views: 0 };
  if (!pvErr) {
    // Likely automated: one visitor, one day, many views, only the home/join/login pages, nothing referring them,
    // not signed in, and most of it inside a quarter of an hour. Scanners look like this; readers don't.
    type PVM = PV & { member?: string | null };
    const all = (pv || []) as PVM[];
    const PUBLIC = new Set(["/", "/join", "/login", "/signup", "/about"]);
    const groups = new Map<string, PVM[]>();
    for (const x of all) { const k = `${new Date(x.at).toLocaleDateString("en-CA", { timeZone: "America/New_York" })}|${x.visitor}`; (groups.get(k) || groups.set(k, []).get(k)!).push(x); }
    const bots = new Set<string>();
    for (const [k, g] of groups) {
      if (g.length < 8) continue;
      if (g.some((x) => x.member || x.ref || x.profile || !PUBLIC.has(x.path))) continue;
      const t = g.map((x) => new Date(x.at).getTime()).sort((p, q) => p - q);
      const window = 15 * 60e3; let best = 0;
      for (let i = 0, j = 0; i < t.length; i++) { while (t[i] - t[j] > window) j++; best = Math.max(best, i - j + 1); }
      if (best / g.length >= 0.6) { bots.add(k); automated = { visitors: automated.visitors + 1, views: automated.views + g.length }; }
    }
    const rows = all.filter((x) => !bots.has(`${new Date(x.at).toLocaleDateString("en-CA", { timeZone: "America/New_York" })}|${x.visitor}`)) as PV[];
    const NY = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD, Eastern time
    const today = NY(new Date().toISOString());
    const span = (days: number) => { const from = NY(new Date(Date.now() - (days - 1) * 864e5).toISOString()); const r = rows.filter((x) => NY(x.at) >= from); return { views: r.length, visitors: new Set(r.map((x) => `${NY(x.at)}|${x.visitor}`)).size }; };
    const top = (key: (x: PV) => string | null, from: PV[], n = 8) => { const c = new Map<string, number>(); for (const x of from) { const k = key(x); if (k) c.set(k, (c.get(k) || 0) + 1); } return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count })); };
    const week = rows.filter((x) => NY(x.at) >= NY(new Date(Date.now() - 6 * 864e5).toISOString()));
    const days = Array.from({ length: 14 }, (_, i) => { const d = NY(new Date(Date.now() - (13 - i) * 864e5).toISOString()); const r = rows.filter((x) => NY(x.at) === d); return { day: d, views: r.length, visitors: new Set(r.map((x) => x.visitor)).size }; });
    traffic = {
      today: span(1), week: span(7), month: span(30), days,
      pages: top((x) => (x.profile ? null : x.path), week), profiles: top((x) => x.profile, week), sources: top((x) => x.ref, week),
      phones: week.length ? Math.round((week.filter((x) => x.device === "phone").length / week.length) * 100) : 0, isToday: today,
      automated,
    };
  }
  const activeByDay = Array.from({ length: 14 }, (_, i) => { const d = NYday(new Date(Date.now() - (13 - i) * 864e5).toISOString()); const who = new Set(((memberViews || []) as { member: string; at: string }[]).filter((v) => NYday(v.at) === d).map((v) => v.member)); return { day: d, members: who.size }; });
  const nameOf = new Map((users?.users || []).map((u) => [u.id, ((u.user_metadata || {}) as { full_name?: string }).full_name || u.email || ""]));
  const referralList = (referrals || []).map((r) => ({ referrer: nameOf.get(r.referrer_id) || r.code || "", referred: nameOf.get(r.referred_id) || r.referred_email || "", paidAt: r.paid_at || "" }));
  return NextResponse.json({
    referrals: referralList,
    usage: { activeByDay, tracked: (memberViews || []).length > 0 },
    traffic,
    asOf: new Date().toISOString(),
    members,
    waitlist: wl.filter((w) => w.status !== "reminder"),
    reminders: wl.filter((w) => w.status === "reminder"),
    codesLeft: (codes || []).filter((c) => !c.redeemed_at).map((c) => c.code),
  });
}

// POST /api/admin/members { action: "verify" | "remove", id }
// verify: marks the member as checked and emails them the Getting Started guide.
// remove: refunds their latest payment, cancels the membership, takes the profile down, and blocks the account.
export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data: me } = await auth.auth.getUser();
  const myEmail = (me.user?.email || "").toLowerCase();
  if (!myEmail || !ADMINS.includes(myEmail)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || ""), action = String(body.action || "");
  const db = createServerSupabase();

  // Someone paid but never finished: create their account from the payment link in their welcome email.
  if (action === "from_payment") {
    const m = String(body.link || "").match(/cs_(?:live|test)_[A-Za-z0-9]+/);
    if (!m) return NextResponse.json({ error: "Paste the link from the welcome email, or the code that starts with cs_live_." }, { status: 400 });
    const p = await paidSession(m[0]);
    if (!p) return NextResponse.json({ error: "Stripe doesn't show a completed payment for that code." }, { status: 404 });
    let uid = "";
    try { uid = await ensureMemberAccount(m[0], p.email, ""); } catch (e) { console.error("from_payment:", e); return NextResponse.json({ error: "Couldn't create the account. Please try again." }, { status: 500 }); }
    const { data: u } = await db.auth.admin.getUserById(uid);
    const needs = !!(u?.user?.app_metadata as { needs_password?: boolean } | undefined)?.needs_password;
    return NextResponse.json({ ok: true, email: p.email, plan: p.planLabel, needsPassword: needs });
  }
  const { data: got } = await db.auth.admin.getUserById(id);
  const u = got?.user;
  if (!u) return NextResponse.json({ error: "No such member." }, { status: 404 });
  const app = (u.app_metadata || {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  if (action === "verify") {
    // verifying a member also gives them the Verified badge on their profile
    const { error } = await db.auth.admin.updateUserById(id, { app_metadata: { ...app, reviewed_at: now, reviewed_by: myEmail, verified: true, verified_by: `${myEmail}, ${now.slice(0, 10)}` } });
    if (error) return NextResponse.json({ error: "Couldn't save that. Please try again." }, { status: 500 });
    // the Getting Started Guide now goes out with the welcome email, so verifying sends nothing
    // if someone referred this member, this verification may complete their 6
    const reward = await grantReferralRewardIfDue(id).catch(() => null);
    return NextResponse.json({ ok: true, reward });
  }

  if (action === "reward_done") {
    const { error } = await db.auth.admin.updateUserById(id, { app_metadata: { ...app, referral_reward_at: now, referral_reward_by: myEmail, referral_reward_credited: true } });
    if (error) return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove") {
    if (ADMINS.includes((u.email || "").toLowerCase())) return NextResponse.json({ error: "You can't remove a Marquee team account." }, { status: 400 });
    const notes: string[] = [];
    // money first: if the refund fails, stop, so nobody is removed while still being charged
    const { data: meta } = await db.from("profiles_meta").select("stripe_customer_id").eq("id", id).maybeSingle();
    const customer = meta?.stripe_customer_id as string | undefined;
    if (customer && stripeReady()) {
      try {
        const subs = await stripe().subscriptions.list({ customer, status: "all", limit: 20 });
        for (const s of subs.data) if (!["canceled", "incomplete_expired"].includes(s.status)) { await stripe().subscriptions.cancel(s.id); notes.push("membership cancelled"); }
        const charges = await stripe().charges.list({ customer, limit: 1 });
        const c = charges.data[0];
        if (c && c.paid && !c.refunded && c.amount > c.amount_refunded) {
          await stripe().refunds.create({ charge: c.id });
          notes.push(`refunded $${((c.amount - c.amount_refunded) / 100).toFixed(2)}`);
        }
      } catch (e) {
        console.error("Admin remove, Stripe:", e);
        return NextResponse.json({ error: "Stripe refused the cancellation or refund, so nothing was changed. Check Stripe and try again." }, { status: 502 });
      }
    }
    const { data: gone } = await db.from("published_profiles").delete().eq("user_id", id).select("username");
    if (gone?.length) notes.push(`profile /${gone[0].username} taken down`);
    const { error } = await db.auth.admin.updateUserById(id, { ban_duration: "876000h", app_metadata: { ...app, founding_member: false, subscription_status: "removed", removed_at: now, removed_by: myEmail } });
    if (error) return NextResponse.json({ error: "The profile is down but the account couldn't be blocked. Please try again." }, { status: 500 });
    notes.push("account blocked");
    return NextResponse.json({ ok: true, notes });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

// DELETE /api/admin/members { email, created_at } -> removes one waitlist entry (spam).
export async function DELETE(req: Request) {
  const auth = await createSupabaseServer();
  const { data: me } = await auth.auth.getUser();
  if (!ADMINS.includes((me.user?.email || "").toLowerCase())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase();
  if (!email) return NextResponse.json({ error: "No email." }, { status: 400 });
  const { error } = await createServerSupabase().from("waitlist").delete().eq("email", email);
  if (error) return NextResponse.json({ error: "Couldn't remove that entry." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
