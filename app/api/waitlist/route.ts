import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, first_name, last_name, source, utm_source, utm_medium, utm_campaign } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.from("waitlist").insert({
    email: email.trim().toLowerCase(),
    first_name: first_name?.trim() || null,
    last_name: last_name?.trim() || null,
    source: source || "landing",
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
  });

  // Duplicate email is fine — already on the waitlist
  if (error && error.code !== "23505") {
    console.error("Waitlist insert error:", error);
    return NextResponse.json(
      { error: "Couldn't save your spot. Try again?" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
