import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { looksLikeSpam } from "@/lib/spam";

// POST /api/community -> saves one "Get to Know You" form. Never readable from here; the admin page reads it.
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (looksLikeSpam(req, b.website_url)) return NextResponse.json({ ok: true }); // junk: answer as if it worked, save nothing

  const row = {
    first_name: str(b.first_name, 80),
    last_name: str(b.last_name, 80),
    email: str(b.email, 200).toLowerCase(),
    linkedin: (() => { const v = str(b.linkedin, 300); if (!v) return null; return /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`; })(),
    background: str(b.background, 4000) || null,
    challenges: str(b.challenges, 4000) || null,
    curious: str(b.curious, 4000) || null,
    anything: str(b.anything, 4000) || null,
    source: str(b.source, 120) || null,
  };
  if (!row.first_name || !row.last_name || !row.email || !row.linkedin) return NextResponse.json({ error: "Please add your first name, last name, email and LinkedIn." }, { status: 400 });
  if (!EMAIL.test(row.email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });

  const db = createServerSupabase();

  // The same person pressing Submit twice (or a refresh that re-posts) must not make two records.
  // A new submission with different answers is kept: it is a new record, not a duplicate.
  const { data: last } = await db.from("community_responses").select("background,challenges,curious,anything,created_at").eq("email", row.email).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (last && last.background === row.background && last.challenges === row.challenges && last.curious === row.curious && last.anything === row.anything) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error } = await db.from("community_responses").insert(row);
  if (error) {
    const missing = error.message.includes("community_responses");
    return NextResponse.json({ error: missing ? "This form isn't set up yet." : "Couldn't save. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
