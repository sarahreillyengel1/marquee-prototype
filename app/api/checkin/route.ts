import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// POST /api/checkin { ask: 2 | 5, answer: "great" | "starting" | "ok" } -> records the member's answer for that ask.
export const dynamic = "force-dynamic";
const ANSWERS = ["great", "starting", "ok"];

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const answer = String(body.answer || "");
  if (!ANSWERS.includes(answer)) return NextResponse.json({ error: "Pick an answer." }, { status: 400 });
  const ask = Number(body.ask);
  if (ask !== 2 && ask !== 5) return NextResponse.json({ error: "Which ask?" }, { status: 400 });
  const db = createServerSupabase();
  const { error } = await db.from("checkins").upsert({ user_id: data.user.id, email: data.user.email || "", ask, answer }, { onConflict: "user_id,ask" });
  if (error) return NextResponse.json({ error: "Couldn't save that just now." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
