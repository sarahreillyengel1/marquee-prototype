// ─────────────────────────────────────────────────────────────
// Writes the search index. Service-role client only; called from server routes.
//   indexProfile      on Publish (with the builder snapshot's hidden set and extras) and on backfill (public JSON only)
//   removeProfile     on unpublish, username change, account removal
//   indexOpportunity  when a role is saved as published; removeOpportunity otherwise
// Topics are reused by item hash, so re-publishing an unchanged storefront makes no Claude call.
// ─────────────────────────────────────────────────────────────
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../profile-types";
import { evidenceFromProfile, indexRowFromProfile, indexRowFromOpportunity, type SnapshotExtras } from "./evidence";
import { addTopics } from "./topics";

export interface IndexResult { username: string; evidence: number; hidden: number; topicsCalls: number; topicsItems: number; reused: number }

export async function indexProfile(db: SupabaseClient, args: { username: string; userId: string | null; profile: Profile; hidden?: string[]; extras?: SnapshotExtras; publishedAt?: string | null }): Promise<IndexResult> {
  const hidden = new Set(args.hidden || []);
  const rows = evidenceFromProfile(args.profile, hidden);

  // reuse topics for items that did not change
  const { data: prior } = await db.from("search_evidence").select("hash,topics").eq("username", args.username);
  const known = new Map<string, string[]>();
  for (const p of prior || []) if (Array.isArray(p.topics) && p.topics.length) known.set(p.hash, p.topics);
  let reused = 0;
  for (const r of rows) { const t = known.get(r.hash); if (t && !r.topics.length) { r.topics = t; reused += 1; } }

  const { calls, items } = await addTopics(rows);
  const index = indexRowFromProfile(args.profile, args.username, hidden, args.extras || {}, rows);

  const { data: up, error } = await db.from("search_index").upsert({
    ...index, user_id: args.userId, opportunity_id: null,
    evidence_count: rows.length, published_at: args.publishedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(), indexed_at: new Date().toISOString(),
  }, { onConflict: "username" }).select("id").single();
  if (error || !up) throw new Error(error?.message || "Couldn't write the index row.");

  await db.from("search_evidence").delete().eq("username", args.username);
  if (rows.length) {
    const { error: e2 } = await db.from("search_evidence").insert(rows.map((r) => ({
      index_id: up.id, username: args.username, user_id: args.userId,
      kind: r.kind, page: r.page, item_id: r.item_id || null, title: r.title, body: r.body,
      date_text: r.date_text || null, source: r.source || null, url: r.url || null,
      topics: r.topics, hash: r.hash, hidden: r.hidden, weight: r.weight,
    })));
    if (e2) throw new Error(e2.message);
  }
  return { username: args.username, evidence: rows.length, hidden: rows.filter((r) => r.hidden).length, topicsCalls: calls, topicsItems: items, reused };
}

export async function removeProfile(db: SupabaseClient, username: string) {
  await db.from("search_evidence").delete().eq("username", username);
  await db.from("search_index").delete().eq("username", username);
}

export async function indexOpportunity(db: SupabaseClient, o: Record<string, unknown>) {
  if (o.status !== "published") { await removeOpportunity(db, Number(o.id)); return; }
  const row = indexRowFromOpportunity(o);
  const { error } = await db.from("search_index").upsert({ ...row, username: null, user_id: null, private_body: "", private_facets: {}, evidence_count: 0, updated_at: new Date().toISOString(), indexed_at: new Date().toISOString() }, { onConflict: "opportunity_id" });
  if (error) throw new Error(error.message);
}

export async function removeOpportunity(db: SupabaseClient, id: number) {
  await db.from("search_index").delete().eq("opportunity_id", id);
}
