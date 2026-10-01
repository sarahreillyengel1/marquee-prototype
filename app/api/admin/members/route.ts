import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

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
  const [{ data: users }, { data: profiles }, { data: waitlist }, { data: codes }] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    db.from("published_profiles").select("username,user_id,published_at"),
    db.from("waitlist").select("email,first_name,last_name,status,notes,linkedin_url,created_at").order("created_at", { ascending: false }),
    db.from("beta_codes").select("code,redeemed_at,redeemed_by"),
  ]);
  const byUser = new Map((profiles || []).map((p) => [p.user_id, p]));
  const codeBy = new Map((codes || []).filter((c) => c.redeemed_by).map((c) => [c.redeemed_by, c.code]));
  const members = (users?.users || []).map((u) => {
    const m = (u.app_metadata || {}) as { plan?: string; founding_member?: boolean; subscription_status?: string; verified?: boolean };
    const meta = (u.user_metadata || {}) as { full_name?: string };
    const p = byUser.get(u.id);
    return {
      name: meta.full_name || "", email: u.email || "", joined: u.created_at, lastSeen: u.last_sign_in_at || "",
      plan: m.plan || (codeBy.get(u.id) ? "invite code" : ""), status: m.subscription_status || "", founding: !!m.founding_member, verified: !!m.verified,
      code: codeBy.get(u.id) || "", username: p?.username || "", publishedAt: p?.published_at || "",
    };
  }).sort((a, b) => b.joined.localeCompare(a.joined));
  const wl = waitlist || [];
  return NextResponse.json({
    asOf: new Date().toISOString(),
    members,
    waitlist: wl.filter((w) => w.status !== "reminder"),
    reminders: wl.filter((w) => w.status === "reminder"),
    codesLeft: (codes || []).filter((c) => !c.redeemed_at).map((c) => c.code),
  });
}
