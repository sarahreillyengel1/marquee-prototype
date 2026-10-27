import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { builderToProfile, type BuilderSnapshot } from "@/lib/builder-to-profile";
import { indexProfile } from "@/lib/search/writer";

// POST /api/search/index { username, snapshot } -> index the signed-in member's storefront for Find an Expert.
// Called by the builder right after Publish succeeds. The snapshot carries the Hide set and the facts the
// public Profile drops (professional types, open to full-time), so hidden sections can match without ever showing.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const snapshot = body.snapshot as BuilderSnapshot | undefined;
  if (!username || !snapshot || typeof snapshot !== "object") return NextResponse.json({ error: "Nothing to index." }, { status: 400 });

  const db = createServerSupabase();
  // only a page this member has published, under this name
  const { data: pub } = await db.from("published_profiles").select("username,published_at").eq("username", username).eq("user_id", user.id).maybeSingle();
  if (!pub) return NextResponse.json({ error: "Publish first." }, { status: 404 });

  try {
    // the full storefront, hidden sections included; the extractor marks them hidden from the snapshot's Hide set
    const full = builderToProfile({ ...snapshot, hidden: [] }, username);
    const result = await indexProfile(db, {
      username, userId: user.id, profile: full, hidden: snapshot.hidden || [],
      extras: { types: snapshot.types, industries: snapshot.industries, openToFullTime: !!snapshot.ftEnabled, fullTimeRoles: snapshot.ftRoles },
      publishedAt: pub.published_at,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("search index:", e);
    return NextResponse.json({ error: "Couldn't index the page. Publishing still worked." }, { status: 500 });
  }
}
