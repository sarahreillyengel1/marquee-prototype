import { createServerSupabase } from "@/lib/supabase";
import { DEMO_PROFILE } from "@/lib/demo-profile";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Serve the hardcoded demo profile without hitting Supabase —
  // so the landing page preview + "See a profile" flow work even
  // before the DB is wired up.
  if (username === "demo") {
    return NextResponse.json(DEMO_PROFILE);
  }

  const supabase = createServerSupabase();

  const { data: profile, error } = await supabase
    .from("generated_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const [{ data: workHistory }, { data: skills }, { data: intake }] =
    await Promise.all([
      supabase
        .from("work_history")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("display_order"),
      supabase
        .from("skills")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("proficiency", { ascending: false }),
      supabase
        .from("intake_answers")
        .select("answers")
        .eq("user_id", profile.user_id)
        .single(),
    ]);

  return NextResponse.json({
    profile,
    workHistory: workHistory || [],
    skills: skills || [],
    answers: intake?.answers || {},
  });
}
