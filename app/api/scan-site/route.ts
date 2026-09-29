import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { scanSite } from "@/lib/site-scan";

// POST /api/scan-site { url } -> { site, siteTitle, pages, items, socials }
// Signed-in members only. Reads the person's website and returns the media found on it.
// Nothing is saved here: the builder shows the list and the person chooses what to add.
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
    return NextResponse.json(await scanSite(url));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // our own messages are written for people; anything else gets a plain fallback
    return NextResponse.json({ error: /website|address|scanned/i.test(msg) ? msg : "We couldn't read that website. Please try again." }, { status: 422 });
  }
}
