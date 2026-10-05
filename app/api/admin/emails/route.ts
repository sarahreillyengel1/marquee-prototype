import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createServerSupabase } from "@/lib/supabase";

// GET /api/admin/emails -> the last emails Marquee sent (our own log), with delivery status from Resend when available.
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

type Row = { id: number; at: string; to_email: string; subject: string; ok: boolean; resend_id: string | null; error: string | null };
type ResendMail = { id: string; last_event?: string };

export async function GET() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  if (!ADMINS.includes((data.user?.email || "").toLowerCase())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: rows, error } = await createServerSupabase().from("email_log").select("*").order("at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message.includes("email_log") ? "The email_log table doesn't exist yet. Run lib/usage-schema.sql in Supabase." : "Couldn't load the email log." }, { status: 500 });
  // delivery status from Resend, when the key is allowed to read (a "full access" key); otherwise we show sent / failed
  const status = new Map<string, string>();
  let resendNote = "";
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const r = await fetch("https://api.resend.com/emails?limit=100", { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
      if (r.ok) { const j = await r.json(); for (const m of ((j.data || []) as ResendMail[])) if (m.last_event) status.set(m.id, m.last_event); }
      else resendNote = r.status === 401 || r.status === 403 ? "Delivery status needs a Resend key with full access; this one can only send." : `Resend answered ${r.status}.`;
    } catch { resendNote = "Couldn't reach Resend for delivery status."; }
  }
  const emails = ((rows || []) as Row[]).map((m) => ({ id: String(m.id), to: m.to_email, subject: m.subject, at: m.at, status: (m.resend_id && status.get(m.resend_id)) || (m.ok ? "sent" : "failed"), error: m.error }));
  return NextResponse.json({ emails, resendNote });
}
