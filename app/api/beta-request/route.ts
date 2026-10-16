import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { looksLikeSpam } from "@/lib/spam";
import { sendBetaRequestNotice } from "@/lib/email";

// POST /api/beta-request { name, email, linkedin } -> { ok }
// Someone on marquee.bio/join asking for an invite code. Saved for the admin Requests page; Sarah gets a note.
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (looksLikeSpam(req, b.website_url)) return NextResponse.json({ ok: true }); // junk: answer as if it worked, save nothing

  const name = str(b.name, 120);
  const email = str(b.email, 200).toLowerCase();
  const li = str(b.linkedin, 300);
  const linkedin = li ? (/^https?:\/\//i.test(li) ? li : `https://${li.replace(/^\/+/, "")}`) : "";
  if (!name || !email || !linkedin) return NextResponse.json({ error: "Please add your name, email and LinkedIn profile." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });

  const db = createServerSupabase();
  // the same person pressing the button twice must not make two requests
  const { data: last } = await db.from("beta_requests").select("id,status").eq("email", email).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (last && last.status === "pending") return NextResponse.json({ ok: true, duplicate: true });

  const { error } = await db.from("beta_requests").insert({ name, email, linkedin });
  if (error) {
    const missing = error.message.includes("beta_requests");
    return NextResponse.json({ error: missing ? "Requests aren't open yet." : "Couldn't save. Please try again." }, { status: 500 });
  }
  await sendBetaRequestNotice({ name, email, linkedin }).catch(() => null);
  return NextResponse.json({ ok: true });
}
