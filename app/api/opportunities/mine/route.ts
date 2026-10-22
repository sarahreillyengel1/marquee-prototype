import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";

// A member's own list: GET /api/opportunities/mine -> saved and applied roles with the listing facts.
export const dynamic = "force-dynamic";
const COLS = "id,slug,title,company,work_type,function,location,remote,pay_min,pay_max,pay_per,pay_note,hours_per_week,start_text,length_text,status,apply_url,require_marquee";

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = createServerSupabase();
  let marks: { opportunity_id: number; created_at: string; applied_at: string | null }[] = [];
  const first = await db.from("saved_opportunities").select("opportunity_id,created_at,applied_at").eq("user_id", me).order("created_at", { ascending: false });
  if (first.error) { // the applied_at column is not there yet
    const { data } = await db.from("saved_opportunities").select("opportunity_id,created_at").eq("user_id", me).order("created_at", { ascending: false });
    marks = (data || []).map((m) => ({ ...m, applied_at: null }));
  } else marks = first.data || [];
  if (!marks.length) return NextResponse.json({ rows: [] });
  const { data: opps } = await db.from("opportunities").select(COLS).in("id", marks.map((m) => m.opportunity_id));
  const byId = new Map((opps || []).map((o) => [o.id, o]));
  const rows = marks.map((m) => ({ ...byId.get(m.opportunity_id), saved_at: m.created_at, applied_at: m.applied_at })).filter((r) => r.id);
  return NextResponse.json({ rows });
}
