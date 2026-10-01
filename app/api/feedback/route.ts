import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { emailReady, sendBetaFeedback } from "@/lib/email";

// POST /api/feedback { kind, message, page? } -> { ok }
// Signed-in members only. A beta member's question, bug report or feature request goes
// straight to the Marquee team by email, with the member's address as the reply-to.
export const dynamic = "force-dynamic";
const KINDS = ["Question", "Something is broken", "Feature request", "Other"];

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  const user = data.user;
  if (!user?.email) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const kind = KINDS.includes(String(body.kind)) ? String(body.kind) : "Other";
  const message = String(body.message || "").trim().slice(0, 4000);
  const page = String(body.page || "").slice(0, 200);
  if (message.length < 3) return NextResponse.json({ error: "Write a few words first." }, { status: 400 });
  if (!emailReady()) return NextResponse.json({ error: "Email isn't switched on yet. Please write to hello@marquee.bio." }, { status: 503 });
  const meta = (user.user_metadata || {}) as { full_name?: string };
  const founding = !!(user.app_metadata as { founding_member?: boolean } | undefined)?.founding_member;
  const sent = await sendBetaFeedback({ kind, message, page, name: meta.full_name || "", email: user.email, founding });
  if (!("ok" in sent) || !sent.ok) return NextResponse.json({ error: "We couldn't send that. Please try again." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
