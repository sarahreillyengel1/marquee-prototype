import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";

// Public. GET /api/opportunities -> every published job, featured first then newest, plus the viewer's saved ids.
// POST { id, save: true|false } (signed in) -> save or unsave.
export const dynamic = "force-dynamic";
const PUBLIC_COLS = "id,slug,title,company,company_url,company_blurb,work_type,function,seniority,location,remote,pay_min,pay_max,pay_per,pay_note,hours_per_week,start_text,length_text,skills,source,featured,published_at,last_checked_at,deadline,require_marquee";

export async function GET() {
  const db = createServerSupabase();
  const { data, error } = await db.from("opportunities").select(PUBLIC_COLS).eq("status", "published").order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ rows: [], saved: [], signedIn: false });
  const me = await currentUserId();
  let saved: number[] = [];
  if (me) { const { data: s } = await db.from("saved_opportunities").select("opportunity_id").eq("user_id", me); saved = (s || []).map((x) => x.opportunity_id); }
  return NextResponse.json({ rows: data || [], saved, signedIn: !!me });
}

export async function POST(req: Request) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in to save opportunities." }, { status: 401 });
  const { id, save } = await req.json().catch(() => ({})) as { id?: number; save?: boolean };
  if (!id) return NextResponse.json({ error: "Which one?" }, { status: 400 });
  const db = createServerSupabase();
  if (save) await db.from("saved_opportunities").upsert({ user_id: me, opportunity_id: id });
  else await db.from("saved_opportunities").delete().eq("user_id", me).eq("opportunity_id", id);
  return NextResponse.json({ ok: true });
}
