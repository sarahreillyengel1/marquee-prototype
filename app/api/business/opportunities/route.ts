import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { WORK_TYPES, FUNCTIONS, SENIORITY, REMOTE, PAY_PER, REQUIRE, BETA_POST_LIMIT, slugify, fetchPostingText, extractOpportunity } from "@/lib/opportunities";
import { sendOpportunityNotice, sendOpportunityReceived } from "@/lib/email";

// A signed-in business account's own opportunities:
//   GET                                     -> my rows, newest first
//   POST { action: "extract", url | text }  -> read a posting and pull the facts out, nothing saved
//   POST { action: "save", row }            -> create (draft, Sarah reviews) or update my own row
//   POST { action: "close", id }            -> close my own row
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => { const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : NaN; return isFinite(n) && n > 0 ? Math.round(n) : null; };
const orNull = (v: string) => (v ? v : null);
const pick = (list: readonly string[], v: unknown, dflt: string | null) => (list.includes(str(v, 20)) ? str(v, 20) : dflt);
const list = (v: unknown, max: number, len: number) => (Array.isArray(v) ? (v as unknown[]).map((x) => str(x, len)).filter(Boolean).slice(0, max) : []);
const MINE = "id,slug,status,title,company,location,remote,work_type,pay_min,pay_max,pay_per,pay_note,hours_per_week,start_text,length_text,description,responsibilities,requirements,skills,apply_url,company_url,company_blurb,function,seniority,deadline,require_marquee,published_at,created_at,updated_at";

async function me() {
  try { const auth = await createSupabaseServer(); const { data } = await auth.auth.getUser(); return data.user || null; } catch { return null; }
}

export async function GET() {
  const u = await me();
  if (!u) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data, error } = await createServerSupabase().from("opportunities").select(MINE).eq("posted_by", u.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Couldn't load." }, { status: 500 });
  return NextResponse.json({ rows: data || [], account: u.app_metadata?.account || "member", name: u.user_metadata?.full_name || "", company: u.app_metadata?.company || u.user_metadata?.company || "" });
}

export async function POST(req: Request) {
  const u = await me();
  if (!u) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const db = createServerSupabase();
  const posterName = str(u.user_metadata?.full_name, 80) || str(u.user_metadata?.first_name, 80);
  const posterEmail = u.email || "";

  if (b.action === "extract") {
    const url = str(b.url, 500);
    const pasted = str(b.text, 20000);
    if (!pasted && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Paste the full link, starting with https://, or paste the posting text." }, { status: 400 });
    try {
      let text = pasted;
      if (!text) {
        const page = await fetchPostingText(url);
        if (page.status >= 400 || page.text.length < 200) return NextResponse.json({ error: "We couldn't read that page. Paste the posting text instead." }, { status: 400 });
        text = page.text;
      }
      const x = await extractOpportunity(url || "(pasted text)", text);
      return NextResponse.json({ fields: { ...x, apply_url: x.apply_url === "(pasted text)" ? "" : x.apply_url } });
    } catch (e) {
      console.error("business extract:", e);
      return NextResponse.json({ error: "We couldn't read that. You can fill the fields in by hand." }, { status: 502 });
    }
  }

  if (b.action === "save") {
    const r = (b.row || {}) as Record<string, unknown>;
    const title = str(r.title, 140), company = str(r.company, 120), apply_url = str(r.apply_url, 500);
    if (!title || !company) return NextResponse.json({ error: "Add the role title and your company." }, { status: 400 });
    if (!/^https?:\/\//i.test(apply_url)) return NextResponse.json({ error: "Add the link where people apply, starting with https://." }, { status: 400 });
    const row = {
      title, company, apply_url,
      company_url: orNull(str(r.company_url, 300)), company_blurb: orNull(str(r.company_blurb, 240)),
      work_type: pick(WORK_TYPES, r.work_type, "full-time"), function: pick(FUNCTIONS, r.function, null), seniority: pick(SENIORITY, r.seniority, null),
      location: orNull(str(r.location, 120)), remote: pick(REMOTE, r.remote, "unknown"),
      pay_min: num(r.pay_min), pay_max: num(r.pay_max), pay_per: pick(PAY_PER, r.pay_per, null), pay_note: orNull(str(r.pay_note, 120)),
      hours_per_week: num(r.hours_per_week), start_text: orNull(str(r.start_text, 80)), length_text: orNull(str(r.length_text, 80)),
      description: orNull(str(r.description, 12000)), responsibilities: list(r.responsibilities, 8, 240), requirements: list(r.requirements, 8, 240), skills: list(r.skills, 12, 40),
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(str(r.deadline, 10)) ? str(r.deadline, 10) : null,
      require_marquee: pick(REQUIRE, r.require_marquee, "optional"),
      updated_at: new Date().toISOString(),
    };
    const id = typeof r.id === "number" ? r.id : null;
    if (id) {
      const { data: cur } = await db.from("opportunities").select("id,slug,status").eq("id", id).eq("posted_by", u.id).maybeSingle();
      if (!cur) return NextResponse.json({ error: "That one isn't yours." }, { status: 403 });
      if (cur.status === "closed") return NextResponse.json({ error: "That opportunity is closed." }, { status: 400 });
      const { data, error } = await db.from("opportunities").update(row).eq("id", id).select(MINE).single();
      if (error) return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
      if (cur.status === "published") sendOpportunityNotice({ title, company, posterName, posterEmail, edited: true, slug: cur.slug }).catch(() => null);
      return NextResponse.json({ row: data });
    }
    const { count } = await db.from("opportunities").select("id", { count: "exact", head: true }).eq("posted_by", u.id).neq("status", "closed");
    if ((count || 0) >= BETA_POST_LIMIT) return NextResponse.json({ error: `During the beta each company can have ${BETA_POST_LIMIT} open opportunities. Close one to post another.` }, { status: 400 });
    const base = slugify(`${company} ${title}`) || `opportunity-${Date.now()}`;
    let slug = base;
    for (let i = 2; i < 50; i++) { const { data: taken } = await db.from("opportunities").select("id").eq("slug", slug).maybeSingle(); if (!taken) break; slug = `${base}-${i}`; }
    const { data, error } = await db.from("opportunities").insert({ ...row, slug, status: "draft", source: "Posted on Marquee", posted_by: u.id, poster_email: posterEmail, poster_name: posterName }).select(MINE).single();
    if (error) { console.error("business save:", error.message); return NextResponse.json({ error: error.message.includes("column") ? "Posting isn't switched on yet." : "Couldn't save." }, { status: 500 }); }
    sendOpportunityNotice({ title, company, posterName, posterEmail, edited: false, slug }).catch(() => null);
    if (posterEmail) sendOpportunityReceived(posterEmail, posterName, title).catch(() => null);
    return NextResponse.json({ row: data });
  }

  if (b.action === "close") {
    const id = typeof b.id === "number" ? b.id : 0;
    const { error } = await db.from("opportunities").update({ status: "closed", closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id).eq("posted_by", u.id);
    if (error) return NextResponse.json({ error: "Couldn't close it." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "What?" }, { status: 400 });
}
