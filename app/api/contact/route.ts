import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    username,
    sender_name,
    sender_email,
    sender_company,
    intent,
    message,
  } = body;

  if (!username || !sender_name || !sender_email || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender_email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message too long" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();

  // Look up the profile owner by username
  const { data: profile, error: profileError } = await supabase
    .from("generated_profiles")
    .select("user_id, name")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { error: insertError } = await supabase
    .from("contact_requests")
    .insert({
      profile_user_id: profile.user_id,
      sender_name: sender_name.slice(0, 200),
      sender_email: sender_email.slice(0, 200),
      sender_company: sender_company?.slice(0, 200) || null,
      intent: intent || "other",
      message: message.slice(0, 2000),
    });

  if (insertError) {
    console.error("Contact insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to send. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, recipient: profile.name });
}
