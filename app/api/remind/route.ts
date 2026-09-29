import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { sendReminderConfirmation } from "@/lib/email";

// POST /api/remind { email, about } -> { ok: true }
// "Remind Me" on the pricing page. Saves the email so we can write on the day Marquee Pro
// opens. This is not a beta application, so it sends no "your request is being reviewed" email.
//   about: "pro-dec-1"   remind me when Marquee Pro opens
//          "founding"    tell me when Founding Member sign-up is switched on
const NOTE: Record<string, string> = { "pro-dec-1": "remind: Marquee Pro opens December 1", founding: "wants: Founding Member sign-up" };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
  const about = NOTE[String(body.about)] ? String(body.about) : "pro-dec-1";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const db = createServerSupabase();
  const note = NOTE[about];
  const { error } = await db.from("waitlist").insert({ email, status: "reminder", source: `pricing-${about}`, notes: note });
  if (error?.code === "23505") {
    // already known to us: keep their record and add what they asked for
    const { data } = await db.from("waitlist").select("notes").eq("email", email).maybeSingle();
    const notes = data?.notes || "";
    if (!notes.includes(note)) await db.from("waitlist").update({ notes: notes ? `${notes} | ${note}` : note }).eq("email", email);
  } else if (error) {
    // some setups only allow known status values
    const retry = await db.from("waitlist").insert({ email, status: "pending", source: `pricing-${about}`, notes: note });
    if (retry.error && retry.error.code !== "23505") { console.error("Reminder save error:", retry.error.message); return NextResponse.json({ error: "We couldn't save that. Please try again." }, { status: 500 }); }
  }
  if (!error) await sendReminderConfirmation(email, about === "founding" ? "founding" : "pro").catch(() => null);
  return NextResponse.json({ ok: true });
}
