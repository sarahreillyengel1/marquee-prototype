import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { siteText } from "@/lib/site-scan";

// POST /api/site-text { url } -> { site, siteTitle, pages, text }
// Signed-in members only. The person's own website as plain text, so the builder can read it
// the way it reads a resume. Nothing is saved here.
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "").trim().slice(0, 300);
  if (!url) return NextResponse.json({ error: "Add your website address first." }, { status: 400 });
  try {
    const r = await siteText(url);
    if (r.text.length < 200) return NextResponse.json({ error: "We opened the site but found very little to read. Try pasting your bio and roles as text instead." }, { status: 422 });
    return NextResponse.json(r);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: /website|address/i.test(msg) ? msg : "We couldn't read that website. Please try again." }, { status: 422 });
  }
}
