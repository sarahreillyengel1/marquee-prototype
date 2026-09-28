import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

// GET  /api/affirm?username=x            -> { counts: { [superpower]: n }, mine: [superpower...] }  (mine = this visitor's)
// POST /api/affirm { username, superpower, visitorId } -> { ok: true, count }
// Resilient: if the table isn't there yet, the profile still renders (zeros).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") || "").trim().toLowerCase();
  const visitorId = (url.searchParams.get("visitorId") || "").trim();
  if (!username) return NextResponse.json({ counts: {}, mine: [] });
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.from("superpower_affirmations").select("superpower,visitor_id").eq("username", username);
    if (error) return NextResponse.json({ counts: {}, mine: [] });
    const counts: Record<string, number> = {}; const mine: string[] = [];
    for (const r of data || []) { counts[r.superpower] = (counts[r.superpower] || 0) + 1; if (visitorId && r.visitor_id === visitorId) mine.push(r.superpower); }
    return NextResponse.json({ counts, mine });
  } catch { return NextResponse.json({ counts: {}, mine: [] }); }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const superpower = String(body.superpower || "").trim().slice(0, 300);
  const visitorId = String(body.visitorId || "").trim().slice(0, 80);
  if (!username || !superpower || !visitorId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  try {
    const supabase = createServerSupabase();
    // unique(username, superpower, visitor_id) makes a repeat click a no-op
    await supabase.from("superpower_affirmations").upsert({ username, superpower, visitor_id: visitorId }, { onConflict: "username,superpower,visitor_id", ignoreDuplicates: true });
    const { count } = await supabase.from("superpower_affirmations").select("id", { count: "exact", head: true }).eq("username", username).eq("superpower", superpower);
    return NextResponse.json({ ok: true, count: count ?? 0 });
  } catch { return NextResponse.json({ error: "Couldn't save that just now." }, { status: 500 }); }
}
