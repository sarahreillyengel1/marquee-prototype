import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// POST /api/settings/username { username } -> renames the member's page: marquee.bio/<username>
export const dynamic = "force-dynamic";
const RESERVED = ["terms", "privacy", "about", "join", "login", "signup", "admin", "api", "dashboard", "stats", "booking", "blueprint", "spotlight", "community", "community-feedback", "analytics", "jobs", "opportunities", "pricing", "business", "settings", "demo", "sample", "marquee", "help", "support", "links"];

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const u = String(body.username || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(u)) return NextResponse.json({ error: "Use 3 to 30 letters, numbers or dashes." }, { status: 400 });
  if (RESERVED.includes(u)) return NextResponse.json({ error: "That page name is reserved. Try another." }, { status: 400 });
  const db = createServerSupabase();
  const { data: taken } = await db.from("published_profiles").select("user_id").eq("username", u).maybeSingle();
  if (taken && taken.user_id !== user.id) return NextResponse.json({ error: "That page name is taken." }, { status: 409 });
  const { data: meta } = await db.from("profiles_meta").select("id").eq("username", u).neq("id", user.id).maybeSingle();
  if (meta) return NextResponse.json({ error: "That page name is taken." }, { status: 409 });
  const { data: mine } = await db.from("published_profiles").select("username,profile").eq("user_id", user.id).maybeSingle();
  if (mine && mine.username !== u) {
    const profile = { ...(mine.profile as Record<string, unknown>), slug: u };
    const { error } = await db.from("published_profiles").update({ username: u, profile }).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "Couldn't rename the page. Try again." }, { status: 500 });
  }
  await db.from("profiles_meta").upsert({ id: user.id, username: u }).then(() => null, () => null);
  return NextResponse.json({ ok: true, username: u, published: !!mine });
}
