import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

// Captures a Blueprint lead (first/last/email) at "save & finish later" or
// "get results". Adds them to the Marquee email DB (waitlist, source=blueprint)
// and creates/updates their in-progress blueprint_results session. Returns the
// session id so the client can keep saving progress + generate into it.
export async function POST(request: Request) {
  const { id, first_name, last_name, email, answers, current_step } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const fn = typeof first_name === "string" ? first_name.trim() || null : null;
  const ln = typeof last_name === "string" ? last_name.trim() || null : null;
  const name = [fn, ln].filter(Boolean).join(" ") || null;

  const supabase = createServerSupabase();
  let sessionId: string | null = id ?? null;

  try {
    if (sessionId) {
      await supabase
        .from("blueprint_results")
        .update({ name, email: cleanEmail, answers: answers ?? {}, current_step: current_step ?? 0, updated_at: new Date().toISOString() })
        .eq("id", sessionId);
    } else {
      // Into the Marquee email database (dedupe-safe: 23505 = already on the list).
      const { error: wlErr } = await supabase.from("waitlist").insert({
        email: cleanEmail, first_name: fn, last_name: ln, status: "pending", source: "blueprint",
      });
      if (wlErr && wlErr.code !== "23505") console.warn("[blueprint] waitlist insert:", wlErr.message);

      const { data, error } = await supabase
        .from("blueprint_results")
        .insert({ name, email: cleanEmail, answers: answers ?? {}, current_step: current_step ?? 0, status: "in_progress" })
        .select("id")
        .single();
      if (error) throw error;
      sessionId = data?.id ?? null;
    }
  } catch (e: any) {
    console.warn("[blueprint] lead save failed:", e?.message || e);
  }

  return NextResponse.json({ id: sessionId });
}
