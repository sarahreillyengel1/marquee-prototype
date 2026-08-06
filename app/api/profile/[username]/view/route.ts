import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Logs one profile view. Called client-side from the public profile page for
// non-owner visits only (owners are filtered on the client). Uses the service
// role so RLS blocks anon writes and this route is the single writer.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Demo profile isn't a real user — nothing to log.
  if (username === "demo") {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServerSupabase();

  const { data: profile } = await supabase
    .from("generated_profiles")
    .select("user_id")
    .eq("username", username)
    .single();

  if (!profile?.user_id) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let referrer: string | null = null;
  try {
    const body = await request.json();
    referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;
  } catch {
    // no body / bad JSON — log the view without a referrer
  }

  await supabase.from("profile_views").insert({
    profile_user_id: profile.user_id,
    referrer,
    path: username,
  });

  return NextResponse.json({ ok: true });
}
