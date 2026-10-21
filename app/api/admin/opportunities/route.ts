import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { WORK_TYPES, FUNCTIONS, SENIORITY, REMOTE, PAY_PER, slugify, fetchPostingText, extractOpportunity, checkPosting } from "@/lib/opportunities";

// Marquee team only. Opportunities:
//   GET                                     -> every row, newest first
//   POST { action: "extract", url | text }  -> read the posting and pull the facts out, nothing saved
//   POST { action: "save", row }            -> create or update (row.id to update)
//   POST { action: "check", id }            -> re-check the link now
//   DELETE { id }                           -> remove
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function allowed() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return ADMINS.includes((data.user?.email || "").toLowerCase());
}
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => { const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : NaN; return isFinite(n) && n > 0 ? Math.round(n) : null; };
const orNull = (v: string) => (v ? v : null);
const pick = (list: readonly string[], v: unknown, dflt: string | null) => (list.includes(str(v, 20)) ? str(v, 20) : dflt);
const list = (v: unknown, max: number, len: number) => (Array.isArray(v) ? (v as unknown[]).map((x) => str(x, len)).filter(Boolean).slice(0, max) : []);

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await createServerSupabase().from("opportunities").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) return NextResponse.json({ error: error.message.includes("opportunities") ? "The opportunities table doesn't exist yet." : "Couldn't load." }, { status: 500 });
  return NextResponse.json({ rows: data || [] });
}

export async function POST(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const db = createServerSupabase();

  if (b.action === "extract") {
    const url = str(b.url, 500);
    const pasted = str(b.text, 20000);
    if (!pasted && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Paste the full link, starting with https://, or paste the posting text." }, { status: 400 });
    try {
      let text = pasted; let host = "";
      if (!text) {
        const page = await fetchPostingText(url);
        if (page.status >= 400) return NextResponse.json({ error: `That page answered ${page.status}. Check the link opens in your browser, or paste the text instead.` }, { status: 400 });
        text = page.text;
      }
      if (url) { try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* ignore */ } }
      const x = await extractOpportunity(url || "(pasted text)", text);
      return NextResponse.json({ fields: { ...x, apply_url: x.apply_url === "(pasted text)" ? "" : x.apply_url, source: host, source_url: url } });
    } catch (e) {
      console.error("job extract:", e);
      return NextResponse.json({ error: "Couldn't read that. You can still fill the fields in by hand." }, { status: 502 });
    }
  }

  if (b.action === "save") {
    const r = (b.row || {}) as Record<string, unknown>;
    const title = str(r.title, 140), company = str(r.company, 120), apply_url = str(r.apply_url, 500);
    if (!title || !company || !/^https?:\/\//i.test(apply_url)) return NextResponse.json({ error: "A title, a company and the application link are needed." }, { status: 400 });
    const row = {
      title, company, apply_url,
      company_url: orNull(str(r.company_url, 300)), company_blurb: orNull(str(r.company_blurb, 160)),
      work_type: pick(WORK_TYPES, r.work_type, "full-time"), function: pick(FUNCTIONS, r.function, null), seniority: pick(SENIORITY, r.seniority, null),
      location: orNull(str(r.location, 120)), remote: pick(REMOTE, r.remote, "unknown"),
      pay_min: num(r.pay_min), pay_max: num(r.pay_max), pay_per: pick(PAY_PER, r.pay_per, null), pay_note: orNull(str(r.pay_note, 120)),
      hours_per_week: num(r.hours_per_week), start_text: orNull(str(r.start_text, 80)), length_text: orNull(str(r.length_text, 80)),
      description: orNull(str(r.description, 4000)), responsibilities: list(r.responsibilities, 8, 240), requirements: list(r.requirements, 8, 240), skills: list(r.skills, 12, 40),
      source: orNull(str(r.source, 80)), source_url: orNull(str(r.source_url, 500)),
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(str(r.deadline, 10)) ? str(r.deadline, 10) : null,
      featured: !!r.featured,
      status: ["draft", "published", "paused", "closed"].includes(str(r.status, 12)) ? str(r.status, 12) : "draft",
      updated_at: new Date().toISOString(),
    };
    const id = typeof r.id === "number" ? r.id : null;
    if (id) {
      const { data: cur } = await db.from("opportunities").select("published_at").eq("id", id).maybeSingle();
      const extra: Record<string, unknown> = {};
      if (row.status === "published" && !cur?.published_at) extra.published_at = new Date().toISOString();
      if (row.status === "closed") extra.closed_at = new Date().toISOString();
      const { data, error } = await db.from("opportunities").update({ ...row, ...extra }).eq("id", id).select("*").single();
      if (error) return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
      return NextResponse.json({ row: data });
    }
    const base = slugify(`${company} ${title}`) || `job-${Date.now()}`;
    let slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: taken } = await db.from("opportunities").select("id").eq("slug", slug).maybeSingle();
      if (!taken) break; slug = `${base}-${i}`;
    }
    const { data, error } = await db.from("opportunities").insert({ ...row, slug, published_at: row.status === "published" ? new Date().toISOString() : null }).select("*").single();
    if (error) return NextResponse.json({ error: error.message.includes("opportunities") ? "The opportunities table doesn't exist yet. Run lib/opportunities-schema.sql in Supabase." : "Couldn't save." }, { status: 500 });
    return NextResponse.json({ row: data });
  }

  if (b.action === "check") {
    const id = typeof b.id === "number" ? b.id : 0;
    const { data: row } = await db.from("opportunities").select("id,apply_url").eq("id", id).maybeSingle();
    if (!row) return NextResponse.json({ error: "Which one?" }, { status: 400 });
    const status = await checkPosting(row.apply_url);
    await db.from("opportunities").update({ last_checked_at: new Date().toISOString(), check_status: status }).eq("id", id);
    return NextResponse.json({ status });
  }

  return NextResponse.json({ error: "What?" }, { status: 400 });
}

export async function DELETE(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await req.json().catch(() => ({})) as { id?: number };
  if (!id) return NextResponse.json({ error: "Which one?" }, { status: 400 });
  const { error } = await createServerSupabase().from("opportunities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't remove it." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
