import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { SPOTLIGHT_TYPES, type SpotlightItem } from "@/lib/spotlight";

// Marquee team only. GET -> every item (drafts too). POST -> add or update one. DELETE -> remove one.
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function allowed() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return ADMINS.includes((data.user?.email || "").toLowerCase());
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await createServerSupabase().from("spotlight_items").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message.includes("spotlight_items") ? "The spotlight_items table doesn't exist yet." : "Couldn't load items." }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

const str = (v: unknown, max = 500) => { const s = typeof v === "string" ? v.trim() : ""; return s ? s.slice(0, max) : null; };
const url = (v: unknown) => { const s = str(v, 1000); if (!s) return null; return /^https?:\/\//i.test(s) ? s : s.startsWith("/") ? s : `https://${s}`; };

export async function POST(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => ({})) as Partial<SpotlightItem> & { id?: number };
  const type = SPOTLIGHT_TYPES.includes(b.type as never) ? b.type : null;
  const title = str(b.title, 200);
  if (!type) return NextResponse.json({ error: "Choose a type." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Give it a title." }, { status: 400 });
  let starts_at: string | null = null;
  if (b.starts_at) { const d = new Date(String(b.starts_at)); if (isNaN(d.getTime())) return NextResponse.json({ error: "That date doesn't look right." }, { status: 400 }); starts_at = d.toISOString(); }
  const row = {
    type, title, kind: str(b.kind, 60), blurb: str(b.blurb, 1000), url: url(b.url), cta: str(b.cta, 40), image_url: url(b.image_url), org: str(b.org, 120), detail: str(b.detail, 160),
    starts_at, place: str(b.place, 80), price: str(b.price, 40), featured: !!b.featured, news: !!b.news, published: !!b.published, sort: Number.isFinite(Number(b.sort)) ? Number(b.sort) : 0,
    source: str(b.source, 80) || "admin", updated_at: new Date().toISOString(),
  };
  const db = createServerSupabase();
  const q = b.id ? db.from("spotlight_items").update(row).eq("id", b.id).select("*").single() : db.from("spotlight_items").insert(row).select("*").single();
  const { data, error } = await q;
  if (error) { console.error("spotlight save:", error.message); return NextResponse.json({ error: "Couldn't save. Please try again." }, { status: 500 }); }
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "No item." }, { status: 400 });
  const { error } = await createServerSupabase().from("spotlight_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't delete." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
