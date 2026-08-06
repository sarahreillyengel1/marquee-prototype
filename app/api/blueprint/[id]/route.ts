import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

// Saves in-progress answers to an existing session (only after a lead exists).
// Fire-and-forget from the client on each step; best-effort.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { answers, current_step } = await request.json();
    const supabase = createServerSupabase();
    await supabase
      .from("blueprint_results")
      .update({ answers: answers ?? {}, current_step: current_step ?? 0, updated_at: new Date().toISOString() })
      .eq("id", params.id);
  } catch (e: any) {
    console.warn("[blueprint] progress save:", e?.message || e);
  }
  return NextResponse.json({ ok: true });
}
