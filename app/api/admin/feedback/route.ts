import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

// Marquee team only. Feedback: GET -> every "Get to Know You" response, newest first. ?format=csv -> a spreadsheet download.
export const dynamic = "force-dynamic";
const ADMINS = (process.env.ADMIN_EMAILS || "sarah@campsix.co,sarah@marquee.bio").split(",").map((e) => e.trim().toLowerCase());

async function allowed() {
  const auth = await createSupabaseServer();
  const { data } = await auth.auth.getUser();
  return ADMINS.includes((data.user?.email || "").toLowerCase());
}

const COLS = ["created_at", "first_name", "last_name", "email", "linkedin", "background", "challenges", "curious", "anything", "source"] as const;
const HEAD = ["Submitted (ET)", "First name", "Last name", "Email", "LinkedIn", "About you", "Challenges", "Curious about", "Anything else", "From page"];
const cell = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const et = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export async function GET(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await createServerSupabase().from("community_responses").select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: error.message.includes("community_responses") ? "The community_responses table doesn't exist yet." : "Couldn't load responses." }, { status: 500 });
  const rows = data || [];
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const lines = [HEAD.join(","), ...rows.map((r) => COLS.map((c) => cell(c === "created_at" ? et(r.created_at) : r[c])).join(","))];
    return new NextResponse("﻿" + lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="marquee-feedback-${new Date().toISOString().slice(0, 10)}.csv"` } });
  }
  return NextResponse.json({ rows });
}

export async function DELETE(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await req.json().catch(() => ({})) as { id?: number };
  if (!id) return NextResponse.json({ error: "Which one?" }, { status: 400 });
  const { error } = await createServerSupabase().from("community_responses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't remove it." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
