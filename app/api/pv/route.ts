import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerSupabase } from "@/lib/supabase";
import { isBotAgent } from "@/lib/spam";

// POST /api/pv { path, ref } -> records one page visit. No cookies; the visitor code changes daily.
export const dynamic = "force-dynamic";
const APP = new Set(["", "about", "join", "login", "signup", "reset-password", "spotlight", "build-preview", "dashboard", "onboard", "blueprint", "booking", "terms", "privacy", "onboard", "dashboard", "stats", "recruiter-preview", "style"]);
const SKIP = /^\/(admin|api|_next)(\/|$)/;

export async function POST(req: Request) {
  try {
    if (isBotAgent(req)) return new NextResponse(null, { status: 204 });
    const body = await req.json().catch(() => ({}));
    const path = String(body.path || "").split("?")[0].slice(0, 200);
    if (!path.startsWith("/") || SKIP.test(path)) return new NextResponse(null, { status: 204 });
    const seg = path.split("/")[1] || "";
    let ref = "";
    try { const h = new URL(String(body.ref || "")).hostname.replace(/^www\./, ""); if (h && h !== "marquee.bio" && h !== "localhost") ref = h.slice(0, 100); } catch { /* no referrer */ }
    const ua = req.headers.get("user-agent") || "";
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const visitor = createHash("sha256").update(`${day}|${ip}|${ua}|${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-12) || ""}`).digest("hex").slice(0, 16);
    const member = /^[0-9a-f-]{36}$/i.test(String(body.member || "")) ? String(body.member) : null;
    const row = { path, profile: APP.has(seg) ? null : seg.toLowerCase().slice(0, 60), ref: ref || null, device: /mobi|iphone|android/i.test(ua) ? "phone" : "computer", country: req.headers.get("x-vercel-ip-country") || null, visitor };
    const db = createServerSupabase();
    const { error } = await db.from("page_views").insert(member ? { ...row, member } : row);
    if (error && member) await db.from("page_views").insert(row); // before the member column exists
  } catch { /* counting must never break a page */ }
  return new NextResponse(null, { status: 204 });
}
