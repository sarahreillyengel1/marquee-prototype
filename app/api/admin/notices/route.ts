import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// Team Marquee only. GET lists every notice and every check-in answer; POST posts, unpublishes or deletes a notice.
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function admin() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  const email = (data.user?.email || "").toLowerCase();
  return email && ADMINS.includes(email) ? email : null;
}

export async function GET() {
  const email = await admin();
  if (!email) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = createServerSupabase();
  const [{ data: notices }, { data: reads }, { data: checkins }, { data: settings }, { data: users }] = await Promise.all([
    db.from("notices").select("id,created_at,title,body,link_url,link_label,published").order("created_at", { ascending: false }),
    db.from("notice_reads").select("notice_id"),
    db.from("checkins").select("id,created_at,user_id,email,ask,answer").order("created_at", { ascending: false }).limit(500),
    db.from("checkin_settings").select("started_at").eq("id", 1).maybeSingle(),
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const readCount = new Map<number, number>();
  for (const r of reads || []) readCount.set(r.notice_id, (readCount.get(r.notice_id) || 0) + 1);
  const name = new Map<string, string>();
  for (const u of users?.users || []) name.set(u.id, String(u.user_metadata?.first_name || u.user_metadata?.name || "").trim());
  return NextResponse.json({
    notices: (notices || []).map((n) => ({ ...n, reads: readCount.get(n.id) || 0 })),
    checkins: (checkins || []).map((c) => ({ ...c, name: name.get(c.user_id) || "" })),
    startedAt: settings?.started_at || "",
    members: users?.users?.length || 0,
  });
}

export async function POST(req: Request) {
  const email = await admin();
  if (!email) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const db = createServerSupabase();
  if (body.action === "post") {
    const title = String(body.title || "").trim();
    if (!title) return NextResponse.json({ error: "A title is needed." }, { status: 400 });
    const { error } = await db.from("notices").insert({ title, body: String(body.body || "").trim(), link_url: String(body.link_url || "").trim(), link_label: String(body.link_label || "").trim(), created_by: email });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body.action === "publish" || body.action === "unpublish") {
    await db.from("notices").update({ published: body.action === "publish" }).eq("id", Number(body.id));
  } else if (body.action === "delete") {
    await db.from("notices").delete().eq("id", Number(body.id));
  } else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
