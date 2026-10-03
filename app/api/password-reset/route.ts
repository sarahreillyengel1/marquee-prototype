import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { sendPasswordReset } from "@/lib/email";

// POST /api/password-reset { email } -> { ok }
// Sends the reset link in Marquee's own email. Always answers ok, so nobody can use it to
// find out which emails have accounts.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const origin = new URL(req.url).origin;
  const db = createServerSupabase();
  const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${origin}/reset-password` } });
  const link = data?.properties?.action_link;
  if (!error && link) await sendPasswordReset(email, link).catch(() => null);
  return NextResponse.json({ ok: true });
}
