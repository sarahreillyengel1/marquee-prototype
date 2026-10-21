import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { isBusinessEmail } from "@/lib/opportunities";

// POST /api/business/signup { name, company, email, password } -> { ok }
// A business account: free, no membership, no profile. It can post opportunities (Sarah reviews) and manage them.
// The account is made here already confirmed, so the person can sign in right away. Work email only.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(b.name || "").trim().slice(0, 80);
  const company = String(b.company || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!name) return NextResponse.json({ error: "Add your name." }, { status: 400 });
  if (!company) return NextResponse.json({ error: "Add your company." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!isBusinessEmail(email)) return NextResponse.json({ error: "Use your work email. Personal addresses like Gmail can't post opportunities." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });

  const db = createServerSupabase();
  const { error } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: name, first_name: name.split(/\s+/)[0], company },
    app_metadata: { account: "business", company },
  });
  if (error) {
    const taken = /already|exists|registered/i.test(error.message);
    return NextResponse.json({ error: taken ? "That email already has an account. Sign in instead." : "Couldn't create the account. Try again." }, { status: taken ? 409 : 500 });
  }
  return NextResponse.json({ ok: true });
}
