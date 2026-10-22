import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabase";
import { COLLECTIONS } from "@/lib/opportunity-collections";

export const dynamic = "force-dynamic";
const SITE = "https://marquee.bio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createServerSupabase();
  const [{ data: opps }, { data: profiles }] = await Promise.all([
    db.from("opportunities").select("slug,updated_at,published_at").eq("status", "published").limit(2000),
    db.from("published_profiles").select("username,published_at").limit(5000),
  ]);
  const fixed: MetadataRoute.Sitemap = ["", "/about", "/pricing", "/opportunities", "/business", "/spotlight", "/blueprint"].map((p) => ({ url: `${SITE}${p}`, changeFrequency: p === "/opportunities" ? "daily" : "weekly", priority: p === "" || p === "/opportunities" ? 1 : 0.7 }));
  const collections: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({ url: `${SITE}/opportunities/${c.key}`, changeFrequency: "daily", priority: 0.9 }));
  const roles: MetadataRoute.Sitemap = (opps || []).map((o) => ({ url: `${SITE}/opportunities/${o.slug}`, lastModified: o.updated_at || o.published_at || undefined, changeFrequency: "weekly", priority: 0.8 }));
  const people: MetadataRoute.Sitemap = (profiles || []).filter((p) => p.username && !/^(zz|test|demo|sample)/i.test(p.username)).map((p) => ({ url: `${SITE}/${p.username}`, lastModified: p.published_at || undefined, changeFrequency: "weekly", priority: 0.6 }));
  return [...fixed, ...collections, ...roles, ...people];
}
