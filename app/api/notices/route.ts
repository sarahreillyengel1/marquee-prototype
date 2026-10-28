import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";
import { checkinDue } from "@/lib/checkin-server";

// GET  /api/notices -> the signed-in member's notifications from Team Marquee, newest first, with
//                      what they have read, and which "How is it going?" ask (2nd or 5th visit) is due, if any.
// POST /api/notices { read: id } | { readAll: true } -> marks notices as opened.
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ notices: [], unread: 0, checkin: 0 });
  const db = createServerSupabase();
  const [{ data: notices }, { data: reads }, { due }] = await Promise.all([
    db.from("notices").select("id,created_at,title,body,link_url,link_label").eq("published", true).order("created_at", { ascending: false }).limit(50),
    db.from("notice_reads").select("notice_id").eq("user_id", me),
    checkinDue(db, me),
  ]);
  const seen = new Set((reads || []).map((r) => r.notice_id));
  const list = (notices || []).map((n) => ({ ...n, read: seen.has(n.id) }));
  // checkin is 0, 2 or 5: which visit's "How is it going?" is due for this member
  return NextResponse.json({ notices: list, unread: list.filter((n) => !n.read).length, checkin: due });
}

export async function POST(req: Request) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = createServerSupabase();
  if (body.readAll) {
    const { data: notices } = await db.from("notices").select("id").eq("published", true);
    const rows = (notices || []).map((n) => ({ notice_id: n.id, user_id: me }));
    if (rows.length) await db.from("notice_reads").upsert(rows, { onConflict: "notice_id,user_id", ignoreDuplicates: true });
  } else if (body.read) {
    await db.from("notice_reads").upsert({ notice_id: Number(body.read), user_id: me }, { onConflict: "notice_id,user_id", ignoreDuplicates: true });
  }
  return NextResponse.json({ ok: true });
}
