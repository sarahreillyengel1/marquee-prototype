import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { mailFor, originOf, type BookingRow } from "@/lib/booking-server";
import { emailReady, sendBookingReminder } from "@/lib/email";

// Runs once a day (see vercel.json). Reminds both sides about sessions in the next 26 hours.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  if (!emailReady()) return NextResponse.json({ sent: 0, reason: "email not configured" });
  const db = createServerSupabase();
  const now = new Date();
  const { data } = await db.from("bookings").select("*").eq("kind", "booking").eq("status", "confirmed").is("reminded_at", null)
    .gte("starts_at", now.toISOString()).lte("starts_at", new Date(now.getTime() + 26 * 3600_000).toISOString()).limit(200);
  let sent = 0;
  for (const b of (data || []) as BookingRow[]) {
    const mail = await mailFor(db, b, originOf(req));
    if (!mail) continue;
    await sendBookingReminder(mail);
    await db.from("bookings").update({ reminded_at: now.toISOString() }).eq("id", b.id);
    sent++;
  }
  return NextResponse.json({ sent });
}
