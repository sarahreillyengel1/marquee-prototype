import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";
import { checkinDue } from "@/lib/checkin-server";

// GET  /api/notices -> the signed-in member's notifications from Team Marquee, newest first, with
//                      what they have read, and which "How is it going?" ask (2nd or 5th visit) is due, if any.
// POST /api/notices { read: id } | { readAll: true } -> marks notices as opened.
//                   { like: id } | { unlike: id }    -> the member's thumbs up on a notice.
//                   { dismiss: id }                  -> read, and gone from the member's list.
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ notices: [], unread: 0, checkin: 0 });
  const db = createServerSupabase();
  const [{ data: notices }, { data: reads }, { due }] = await Promise.all([
    db.from("notices").select("id,created_at,tag,title,body,link_url,link_label").eq("published", true).order("created_at", { ascending: false }).limit(50),
    db.from("notice_reads").select("notice_id,liked_at,dismissed_at").eq("user_id", me),
    checkinDue(db, me),
  ]);
  const seen = new Set((reads || []).map((r) => r.notice_id));
  const liked = new Set((reads || []).filter((r) => r.liked_at).map((r) => r.notice_id));
  const gone = new Set((reads || []).filter((r) => r.dismissed_at).map((r) => r.notice_id));
  const list = (notices || []).filter((n) => !gone.has(n.id)).map((n) => ({ ...n, read: seen.has(n.id), liked: liked.has(n.id) }));
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
  } else if (body.like) {
    // a like counts as opened too; the row is updated if it exists, so read_at is kept
    await db.from("notice_reads").upsert({ notice_id: Number(body.like), user_id: me, liked_at: new Date().toISOString() }, { onConflict: "notice_id,user_id" });
  } else if (body.dismiss) {
    await db.from("notice_reads").upsert({ notice_id: Number(body.dismiss), user_id: me, dismissed_at: new Date().toISOString() }, { onConflict: "notice_id,user_id" });
  } else if (body.unlike) {
    await db.from("notice_reads").update({ liked_at: null }).eq("notice_id", Number(body.unlike)).eq("user_id", me);
  }
  return NextResponse.json({ ok: true });
}
