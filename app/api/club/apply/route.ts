import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { looksLikeSpam } from "@/lib/spam";
import { sendClubApplicationNotice } from "@/lib/email";

// POST /api/club/apply -> saves one Future Worth Club application (lib/club-schema.sql). Never readable from here.
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const url = (v: string) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`) : "");

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (looksLikeSpam(req, b.website_url)) return NextResponse.json({ ok: true }); // junk: answer as if it worked, save nothing

  const ig = str(b.instagram, 120).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "");
  const row = {
    name: str(b.name, 120),
    email: str(b.email, 200).toLowerCase(),
    link: url(str(b.link, 300)),
    instagram: ig || null,
    why: str(b.why, 4000) || null,
    source: str(b.source, 120) || null,
  };
  if (!row.name || !row.email || !row.link || !row.why) return NextResponse.json({ error: "Please add your name, email, a LinkedIn or Marquee profile, and a few words about yourself." }, { status: 400 });
  if (!EMAIL.test(row.email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });

  const db = createServerSupabase();

  // Submit pressed twice, or a refresh that re-posts: one record, not two.
  const { data: last } = await db.from("club_applications").select("why").eq("email", row.email).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (last && last.why === row.why) return NextResponse.json({ ok: true, duplicate: true });

  const { error } = await db.from("club_applications").insert(row);
  if (error) {
    const missing = error.message.includes("club_applications");
    return NextResponse.json({ error: missing ? "Applications aren't open yet. Please try again soon." : "Couldn't save. Please try again." }, { status: 500 });
  }
  await sendClubApplicationNotice(row).catch(() => {});
  return NextResponse.json({ ok: true });
}
