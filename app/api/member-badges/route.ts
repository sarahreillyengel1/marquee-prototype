import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// GET /api/member-badges?username=x -> { founding: boolean, verified: boolean }
// Whether the profile's owner is a Founding Member. Answered by the server from the person's
// membership, so the badge can't be added by editing a profile.
export const dynamic = "force-dynamic";
const LIVE = new Set(["active", "trialing", "past_due"]);

export async function GET(req: Request) {
  const username = (new URL(req.url).searchParams.get("username") || "").trim().toLowerCase();
  if (!username) return NextResponse.json({ founding: false });
  try {
    const db = createServerSupabase();
    const { data } = await db.from("published_profiles").select("user_id").eq("username", username).maybeSingle();
    let userId = data?.user_id as string | undefined;
    // not published yet (the builder's preview): show the signed-in person their own badges
    if (!userId && new URL(req.url).searchParams.get("me") === "1") {
      try { const auth = await createSupabaseServer(); const { data: me } = await auth.auth.getUser(); userId = me.user?.id; } catch { /* signed out */ }
    }
    if (!userId) return NextResponse.json({ founding: false, verified: false });
    const { data: u, error } = await db.auth.admin.getUserById(userId);
    if (error) console.error("member-badges: account lookup failed:", error.status, error.message);
    const m = (u.user?.app_metadata || {}) as { founding_member?: boolean; subscription_status?: string; verified?: boolean };
    // the badge lasts as long as the membership does; Verified is granted by Marquee on the account
    return NextResponse.json({ founding: !!m.founding_member && LIVE.has(m.subscription_status || ""), verified: !!m.verified }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) { console.error("member-badges:", e); return NextResponse.json({ founding: false }); }
}
