import { NextResponse } from "next/server";
import { refreshSuggestions } from "@/lib/spotlight-suggest";
import { createSupabaseServer } from "@/lib/supabase-server";

// Weekly (vercel.json), and on demand from the Spotlight editor: find new events and save them as suggestions.
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function run() {
  try { return NextResponse.json(await refreshSuggestions()); }
  catch (e) { console.error("spotlight suggestions:", e); return NextResponse.json({ error: "Couldn't finish the search. Try again in a minute." }, { status: 500 }); }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  return run();
}

// the editor's "Find new events" button
export async function POST() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  if (!ADMINS.includes((data.user?.email || "").toLowerCase())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return run();
}
