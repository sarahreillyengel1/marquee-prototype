import { NextResponse } from "next/server";
import { looksLikeSpam } from "@/lib/spam";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// Affirm — signed-in people affirm a superpower, and their face shows on the profile.
//
// GET  /api/affirm?username=x -> { powers: { [superpower]: { count, people: Person[] } }, mine: string[], signedIn, isOwner, hasProfile }
// POST /api/affirm { username, superpower } -> { ok, count, people }   (401 signed out · 403 no Marquee profile, or own profile)
// Only people with a published Marquee profile can affirm, so a name and a face stand behind each one.
//
// A signed-in affirmation is stored with visitor_id = "user:<auth uid>". Older anonymous rows
// (a bare browser id) are ignored, so every affirmation shown belongs to a real account.
// Resilient: if the table isn't there, the profile still renders (no affirmations).

type Person = { name: string; photoUrl?: string; slug?: string };
const PREFIX = "user:";
const FACES = 3;

async function currentUserId(): Promise<string | null> {
  try {
    const auth = await createSupabaseServer();
    const { data } = await auth.auth.getUser();
    return data.user?.id ?? null;
  } catch { return null; }
}

// Faces come from each affirmer's own published profile. No profile: initials from their account name,
// or a plain person icon when the account has no name. Never the email.
async function peopleFor(supabase: ReturnType<typeof createServerSupabase>, ids: string[]): Promise<Record<string, Person>> {
  const out: Record<string, Person> = {};
  if (!ids.length) return out;
  const { data } = await supabase.from("published_profiles").select("user_id,username,profile").in("user_id", ids);
  for (const r of data || []) {
    const p = (r.profile || {}) as { name?: string; photoUrl?: string };
    if (r.user_id && p.name) out[r.user_id] = { name: p.name, photoUrl: p.photoUrl || undefined, slug: r.username };
  }
  for (const id of ids) {
    if (out[id]) continue;
    try {
      const { data: u } = await supabase.auth.admin.getUserById(id);
      const meta = (u.user?.user_metadata || {}) as { full_name?: string; name?: string };
      out[id] = { name: (meta.full_name || meta.name || "").trim() };
    } catch { out[id] = { name: "" }; }
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") || "").trim().toLowerCase();
  const empty = { powers: {}, mine: [], signedIn: false, isOwner: false, hasProfile: false };
  if (!username) return NextResponse.json(empty);
  try {
    const supabase = createServerSupabase();
    const me = await currentUserId();
    const { data, error } = await supabase.from("superpower_affirmations").select("superpower,visitor_id,created_at").eq("username", username).like("visitor_id", `${PREFIX}%`).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ...empty, signedIn: !!me });
    const rows = (data || []).map((r) => ({ superpower: r.superpower as string, uid: String(r.visitor_id).slice(PREFIX.length) }));
    const people = await peopleFor(supabase, Array.from(new Set(rows.map((r) => r.uid))));
    const powers: Record<string, { count: number; people: Person[] }> = {};
    const mine: string[] = [];
    for (const r of rows) {
      const p = (powers[r.superpower] ||= { count: 0, people: [] });
      p.count += 1;
      if (p.people.length < FACES && people[r.uid]) p.people.push(people[r.uid]);
      if (me && r.uid === me) mine.push(r.superpower);
    }
    let isOwner = false, hasProfile = false;
    if (me) {
      const { data: own } = await supabase.from("published_profiles").select("user_id").eq("username", username).maybeSingle();
      isOwner = own?.user_id === me;
      const { data: mineProfile } = await supabase.from("published_profiles").select("username").eq("user_id", me).limit(1);
      hasProfile = (mineProfile || []).length > 0;
    }
    return NextResponse.json({ powers, mine, signedIn: !!me, isOwner, hasProfile });
  } catch { return NextResponse.json(empty); }
}

export async function POST(req: Request) {
  if (looksLikeSpam(req)) return NextResponse.json({ ok: true, success: true }); // junk: answer as if it worked, do nothing
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const superpower = String(body.superpower || "").trim().slice(0, 300);
  if (!username || !superpower) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in to affirm." }, { status: 401 });
  try {
    const supabase = createServerSupabase();
    const { data: own } = await supabase.from("published_profiles").select("user_id").eq("username", username).maybeSingle();
    if (own?.user_id === me) return NextResponse.json({ error: "You can't affirm your own superpower." }, { status: 403 });
    const { data: mineProfile } = await supabase.from("published_profiles").select("username").eq("user_id", me).limit(1);
    if (!(mineProfile || []).length) return NextResponse.json({ error: "Publish your Marquee profile to affirm." }, { status: 403 });
    // unique(username, superpower, visitor_id) makes a repeat click a no-op
    const { error } = await supabase.from("superpower_affirmations").upsert({ username, superpower, visitor_id: PREFIX + me }, { onConflict: "username,superpower,visitor_id", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: "Couldn't save that just now." }, { status: 500 });
    const { data } = await supabase.from("superpower_affirmations").select("visitor_id,created_at").eq("username", username).eq("superpower", superpower).like("visitor_id", `${PREFIX}%`).order("created_at", { ascending: false });
    const ids = (data || []).map((r) => String(r.visitor_id).slice(PREFIX.length));
    const people = await peopleFor(supabase, ids.slice(0, FACES));
    return NextResponse.json({ ok: true, count: ids.length, people: ids.slice(0, FACES).map((id) => people[id]).filter(Boolean) });
  } catch { return NextResponse.json({ error: "Couldn't save that just now." }, { status: 500 }); }
}
