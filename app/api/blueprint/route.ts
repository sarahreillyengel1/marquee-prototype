import { NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/blueprint/engine";
import { createServerSupabase } from "@/lib/supabase";

// POST { answers } → { id, result }. Generates the Blueprint and saves it so it
// has a shareable URL (/blueprint/[id]). Save is best-effort: if the
// blueprint_results table doesn't exist yet (run lib/blueprint/schema.sql),
// generation still succeeds and `id` comes back null.
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { id: sessionId, answers } = await request.json();
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    const result = await generateBlueprint(answers);

    let id: string | null = sessionId ?? null;
    try {
      const supabase = createServerSupabase();
      const row = { answers, result, status: "complete", model: result.meta.model, processing_ms: result.meta.ms, updated_at: new Date().toISOString() };
      if (id) {
        // Attach results to the existing session (created at lead capture).
        await supabase.from("blueprint_results").update(row).eq("id", id);
      } else {
        const { data, error } = await supabase.from("blueprint_results").insert(row).select("id").single();
        if (error) throw error;
        id = data?.id ?? null;
      }
    } catch (saveErr: any) {
      // Table missing / RLS / etc. — don't fail the request over persistence.
      console.warn("[blueprint] save skipped:", saveErr?.message || saveErr);
    }

    return NextResponse.json({ id, result });
  } catch (err: any) {
    console.error("[blueprint] generation failed:", err?.message || err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
