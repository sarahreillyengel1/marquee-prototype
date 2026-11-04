import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { looksLikeSpam } from "@/lib/spam";
import { sendReportLeadNotice } from "@/lib/email";
import { REPORTS } from "@/lib/reports";

// POST /api/reports/expertise-worth { first_name, email, utm_* } -> { ok, ready, url? }
// A lead from the "What is your expertise worth?" report page. Saved on the waitlist table
// (source "report-expertise-worth") so it shows with the other sign-ups; Sarah gets a note.
export const dynamic = "force-dynamic";

const R = REPORTS["expertise-worth"];
const REPORT = R.title, READY = R.ready, PDF = R.pdf;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (looksLikeSpam(req, b.website_url)) return NextResponse.json({ ok: true, ready: READY, url: READY ? PDF : undefined }); // junk: answer as if it worked, save nothing

  const first_name = str(b.first_name, 120);
  const email = str(b.email, 200).toLowerCase();
  if (!first_name || !email) return NextResponse.json({ error: "Please add your first name and email." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });

  const db = createServerSupabase();
  const { error } = await db.from("waitlist").insert({
    email, first_name, status: "pending",
    source: "report-expertise-worth",
    notes: `report: ${REPORT}${READY ? "" : " (asked before release)"}`,
    utm_source: str(b.utm_source, 120) || null, utm_medium: str(b.utm_medium, 120) || null, utm_campaign: str(b.utm_campaign, 120) || null,
  });
  // 23505 = this email is already on the list. They still get the report.
  if (error && error.code !== "23505") {
    console.error("Report lead insert error:", error);
    return NextResponse.json({ error: "Couldn't save. Please try again." }, { status: 500 });
  }
  if (!error) await sendReportLeadNotice({ first_name, email, report: REPORT, ready: READY }).catch(() => null);
  return NextResponse.json({ ok: true, ready: READY, url: READY ? PDF : undefined });
}
