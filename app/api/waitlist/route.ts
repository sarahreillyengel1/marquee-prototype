import { createServerSupabase } from "@/lib/supabase";
import { sendWaitlistConfirmation, sendWaitlistNotification } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, first_name, last_name, linkedin, source, utm_source, utm_medium, utm_campaign } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Normalize LinkedIn: accept "linkedin.com/in/x" or a full URL, store a clean https URL.
  let linkedinUrl: string | null = null;
  const rawLinkedin = typeof linkedin === "string" ? linkedin.trim() : "";
  if (rawLinkedin) {
    linkedinUrl = /^https?:\/\//i.test(rawLinkedin) ? rawLinkedin : `https://${rawLinkedin}`;
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.from("waitlist").insert({
    email: email.trim().toLowerCase(),
    first_name: first_name?.trim() || null,
    last_name: last_name?.trim() || null,
    linkedin_url: linkedinUrl,
    status: "pending",
    source: source || "landing",
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
  });

  // Duplicate email is fine — already on the waitlist (don't re-send the confirmation)
  if (error && error.code !== "23505") {
    console.error("Waitlist insert error:", error);
    return NextResponse.json(
      { error: "Couldn't save your spot. Try again?" },
      { status: 500 }
    );
  }

  // Fresh application → send "your request is being reviewed" to the applicant, and
  // (optionally) notify the team. Both are inert until RESEND_API_KEY is configured,
  // and neither failing blocks the response.
  if (!error) {
    const cleanEmail = email.trim().toLowerCase();
    await Promise.allSettled([
      sendWaitlistConfirmation(cleanEmail, first_name),
      sendWaitlistNotification({ first_name, last_name, email: cleanEmail, linkedin_url: linkedinUrl }),
    ]);
  }

  return NextResponse.json({ success: true });
}
