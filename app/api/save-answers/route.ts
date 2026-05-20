import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId, answers } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  // Upsert answers — merge with existing
  const { data: existing } = await supabase
    .from("intake_answers")
    .select("answers")
    .eq("user_id", userId)
    .single();

  const merged = { ...(existing?.answers || {}), ...answers };

  const { error } = await supabase.from("intake_answers").upsert(
    {
      user_id: userId,
      answers: merged,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Save answers error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
