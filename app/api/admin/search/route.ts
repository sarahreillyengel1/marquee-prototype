import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Profile } from "@/lib/profile-types";
import { indexProfile, indexOpportunity, removeProfile, type IndexResult } from "@/lib/search/writer";

// Marquee team only. The search index:
//   GET                                  -> counts, and every indexed row with its evidence count
//   GET ?username=x                      -> that member's evidence rows, as the Why will read them
//   POST { action: "backfill" }          -> index every published profile (public JSON only; hidden sections arrive at the next Publish) and every published opportunity
//   POST { action: "reindex", username } -> one member, from the published JSON
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function allowed() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return ADMINS.includes((data.user?.email || "").toLowerCase());
}

const missing = (msg: string) => msg.includes("search_index") || msg.includes("search_evidence");

export async function GET(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = createServerSupabase();
  const username = new URL(req.url).searchParams.get("username")?.trim().toLowerCase();
  if (username) {
    const { data, error } = await db.from("search_evidence").select("kind,page,item_id,title,body,date_text,source,url,topics,hidden,weight").eq("username", username).order("weight", { ascending: false }).order("id");
    if (error) return NextResponse.json({ error: missing(error.message) ? "The search tables don't exist yet. Run lib/search-schema.sql in Supabase." : "Couldn't load." }, { status: 500 });
    const { data: row } = await db.from("search_index").select("title,subtitle,facets,private_facets,card,indexed_at,evidence_count").eq("username", username).maybeSingle();
    return NextResponse.json({ username, row, evidence: data || [] });
  }
  const { data: rows, error } = await db.from("search_index").select("id,kind,username,opportunity_id,title,subtitle,evidence_count,published_at,indexed_at").order("indexed_at", { ascending: false }).limit(2000);
  if (error) return NextResponse.json({ error: missing(error.message) ? "The search tables don't exist yet. Run lib/search-schema.sql in Supabase." : "Couldn't load." }, { status: 500 });
  const { data: ev } = await db.from("search_evidence").select("kind,hidden");
  const byKind: Record<string, number> = {};
  let hidden = 0;
  for (const e of ev || []) { byKind[e.kind] = (byKind[e.kind] || 0) + 1; if (e.hidden) hidden += 1; }
  const [{ count: profiles }, { count: opps }] = await Promise.all([
    db.from("published_profiles").select("username", { count: "exact", head: true }),
    db.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);
  const all = rows || [];
  return NextResponse.json({
    counts: {
      professionals: all.filter((r) => r.kind === "professional").length, opportunities: all.filter((r) => r.kind === "opportunity").length,
      evidence: (ev || []).length, hidden, byKind,
      publishedProfiles: profiles || 0, publishedOpportunities: opps || 0,
    },
    rows: all,
  });
}

export async function POST(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = createServerSupabase();
  const b = await req.json().catch(() => ({}));

  if (b.action === "reindex" || b.action === "backfill") {
    const only = b.action === "reindex" ? String(b.username || "").trim().toLowerCase() : "";
    if (b.action === "reindex" && !only) return NextResponse.json({ error: "Which member?" }, { status: 400 });
    let q = db.from("published_profiles").select("username,user_id,profile,published_at");
    if (only) q = q.eq("username", only);
    const { data: profiles, error } = await q;
    if (error) return NextResponse.json({ error: "Couldn't read published profiles." }, { status: 500 });
    const done: IndexResult[] = [], failed: string[] = [];
    for (const p of profiles || []) {
      if (!p.username || /^(zz|test|demo|sample)/i.test(p.username)) continue;
      try {
        const r = await indexProfile(db, { username: p.username, userId: p.user_id, profile: p.profile as Profile, hidden: [], extras: {}, publishedAt: p.published_at });
        done.push(r);
      } catch (e) { console.error("backfill", p.username, e); failed.push(p.username); }
    }
    // drop rows for pages that are no longer published
    if (!only) {
      const live = new Set((profiles || []).map((p) => p.username));
      const { data: indexed } = await db.from("search_index").select("username").eq("kind", "professional");
      for (const r of indexed || []) if (r.username && !live.has(r.username)) await removeProfile(db, r.username);
    }
    let opportunities = 0;
    if (!only) {
      const { data: opps } = await db.from("opportunities").select("*").eq("status", "published");
      for (const o of opps || []) { try { await indexOpportunity(db, o); opportunities += 1; } catch (e) { console.error("backfill opportunity", o.id, e); } }
      const liveIds = new Set((opps || []).map((o) => o.id));
      const { data: indexedOpps } = await db.from("search_index").select("opportunity_id").eq("kind", "opportunity");
      for (const r of indexedOpps || []) if (r.opportunity_id && !liveIds.has(r.opportunity_id)) await db.from("search_index").delete().eq("opportunity_id", r.opportunity_id);
    }
    const first = done[0];
    if (only && !first && !failed.length) return NextResponse.json({ error: "No published page with that name." }, { status: 404 });
    return NextResponse.json({ ok: true, profiles: done, failed, opportunities });
  }

  return NextResponse.json({ error: "What?" }, { status: 400 });
}
