import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { sendApplication } from "@/lib/email";

// POST /api/opportunities/apply { slug, note } -> a member applies with their Marquee. Needs a signed-in member with a published profile.
// The application goes to whoever posted the role (today: Sarah, for roles Marquee curates). Saved in `applications` when that table exists.
export const dynamic = "force-dynamic";
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const auth = await createSupabaseServer();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const slug = s(b.slug, 120), note = s(b.note, 2000);
  const db = createServerSupabase();
  const { data: prof } = await db.from("published_profiles").select("username,profile").eq("user_id", user.id).maybeSingle();
  if (!prof?.username) return NextResponse.json({ error: "Publish your Marquee first, then apply." }, { status: 400 });
  const { data: job } = await db.from("opportunities").select("id,title,company,poster_email,apply_url").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!job) return NextResponse.json({ error: "That role is no longer open." }, { status: 404 });
  if (!job.apply_url.startsWith("apply:")) return NextResponse.json({ error: "This role takes applications on the company's site." }, { status: 400 });
  const name = s((prof.profile as { name?: string } | null)?.name, 100) || s(user.user_metadata?.full_name, 100) || prof.username;
  const email = user.email || "";
  const marquee = `https://marquee.bio/${prof.username}`;
  const { data: dup } = await db.from("applications").select("id").eq("opportunity_id", job.id).eq("user_id", user.id).maybeSingle().then((r) => r, () => ({ data: null }));
  if (dup) return NextResponse.json({ error: "You already applied for this role." }, { status: 409 });
  await db.from("applications").insert({ opportunity_id: job.id, user_id: user.id, name, email, marquee_url: marquee, note: note || null }).then(() => null, () => null);
  await db.from("saved_opportunities").upsert({ user_id: user.id, opportunity_id: job.id, applied_at: new Date().toISOString() }).then(() => null, () => null);
  await sendApplication({ to: job.poster_email || process.env.BETA_INBOX || "sarah@marquee.bio", title: job.title, company: job.company, name, email, marquee, note, slug });
  return NextResponse.json({ ok: true });
}
