import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { sendInviteCode } from "@/lib/email";

// Marquee team only. Code requests from marquee.bio/join.
//   GET                          -> every request, newest first
//   POST { id, action: "approve" } -> emails the invite code, marks approved
//   POST { id, action: "decline" } -> marks declined, sends nothing
//   DELETE { id }                -> removes the row
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());
// the one code everyone approved receives; it lives in Stripe under the beta coupon
const INVITE_CODE =(process.env.BETA_INVITE_CODE || "MARQUEE-BETA").toUpperCase();

async function allowed() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return ADMINS.includes((data.user?.email || "").toLowerCase());
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await createServerSupabase().from("beta_requests").select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: error.message.includes("beta_requests") ? "The beta_requests table doesn't exist yet." : "Couldn't load requests." }, { status: 500 });
  return NextResponse.json({ rows: data || [], code: INVITE_CODE });
}

export async function POST(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id, action } = await req.json().catch(() => ({})) as { id?: number; action?: string };
  if (!id || (action !== "approve" && action !== "decline")) return NextResponse.json({ error: "Which one?" }, { status: 400 });
  const db = createServerSupabase();
  const { data: row } = await db.from("beta_requests").select("*").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "That request is gone." }, { status: 404 });

  if (action === "approve") {
    const r = await sendInviteCode(row.email, row.name, INVITE_CODE);
    if ("ok" in r && !r.ok) return NextResponse.json({ error: "The email didn't send. Nothing was changed." }, { status: 502 });
    await db.from("beta_requests").update({ status: "approved", decided_at: new Date().toISOString(), code_sent: INVITE_CODE }).eq("id", id);
    return NextResponse.json({ ok: true, sent: !("skipped" in r) });
  }
  await db.from("beta_requests").update({ status: "declined", decided_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await req.json().catch(() => ({})) as { id?: number };
  if (!id) return NextResponse.json({ error: "Which one?" }, { status: 400 });
  const { error } = await createServerSupabase().from("beta_requests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't remove it." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
