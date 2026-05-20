import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, userId } = await request.json();

  if (!code || !userId) {
    return NextResponse.json({ error: "Missing code or userId" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Check if code exists and is not redeemed
  const { data: betaCode, error } = await supabase
    .from("beta_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (error || !betaCode) {
    return NextResponse.json(
      { error: "That code isn't valid. Need one? Join the waitlist." },
      { status: 400 }
    );
  }

  if (betaCode.redeemed_at) {
    return NextResponse.json(
      { error: "That code has already been used." },
      { status: 400 }
    );
  }

  // Redeem the code
  const { error: updateError } = await supabase
    .from("beta_codes")
    .update({ redeemed_at: new Date().toISOString(), redeemed_by: userId })
    .eq("code", code.trim().toUpperCase());

  if (updateError) {
    return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
  }

  // Update user profile meta
  const { error: profileError } = await supabase
    .from("profiles_meta")
    .upsert({
      id: userId,
      subscription_status: "beta",
      beta_code_used: code.trim().toUpperCase(),
    });

  if (profileError) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  // Auto-confirm email so the new beta user can immediately sign in
  // (the beta code itself is the gate; we don't need email verification on top).
  await supabase.auth.admin.updateUserById(userId, { email_confirm: true });

  return NextResponse.json({ success: true });
}
