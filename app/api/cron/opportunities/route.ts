import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { checkPosting } from "@/lib/opportunities";

// Weekly (vercel.json): does each published posting still open? "gone" is flagged for Sarah, never closed automatically.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const db = createServerSupabase();
  const { data } = await db.from("opportunities").select("id,apply_url").in("status", ["published", "paused"]).limit(400);
  const counts = { ok: 0, gone: 0, error: 0 };
  for (const row of data || []) {
    const status = await checkPosting(row.apply_url);
    counts[status] += 1;
    await db.from("opportunities").update({ last_checked_at: new Date().toISOString(), check_status: status }).eq("id", row.id);
  }
  return NextResponse.json(counts);
}
