import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";
import { money } from "@/lib/booking";

// GET /api/analytics (signed in) -> the member's own numbers: visits, bookings, requests. Sales come from /api/store/orders.
export const dynamic = "force-dynamic";

const PAGE_LABEL: Record<string, string> = { "": "Home page", links: "Social Links", full: "Home page", experience: "Experience", media: "Media", shop: "Shop", "work-with-me": "Work with Me", thanks: "Thank-you page" };

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = createServerSupabase();
  const { data: pub } = await db.from("published_profiles").select("username,published_at").eq("user_id", me).maybeSingle();
  if (!pub?.username) return NextResponse.json({ published: false });
  const username = pub.username as string;
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [{ data: views }, { data: bookings }] = await Promise.all([
    db.from("page_views").select("at,path,ref,device,country,visitor").eq("profile", username).order("at", { ascending: false }).limit(5000),
    db.from("bookings").select("kind,status,starts_at,price_cents,created_at,visitor_email").eq("username", username).limit(2000),
  ]);
  const v = views || [];
  const last30 = v.filter((x) => x.at >= since30);
  const pageOf = (path: string) => { const seg = (path || "").split("/").filter(Boolean)[1] || ""; return PAGE_LABEL[seg] || seg; };
  const count = <T,>(list: T[], key: (x: T) => string) => { const m = new Map<string, number>(); for (const x of list) { const k = key(x); if (k) m.set(k, (m.get(k) || 0) + 1); } return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n })); };
  // visits per day for the last 30 days, oldest first, so a simple bar chart can be drawn
  const byDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) byDay[new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10)] = 0;
  for (const x of last30) { const d = x.at.slice(0, 10); if (d in byDay) byDay[d] += 1; }

  const b = bookings || [];
  const confirmed = b.filter((x) => x.kind === "booking" && x.status === "confirmed");
  const upcoming = confirmed.filter((x) => x.starts_at && x.starts_at >= new Date().toISOString());
  const paidCents = confirmed.reduce((n, x) => n + (x.price_cents || 0), 0);

  return NextResponse.json({
    published: true, username, publishedAt: pub.published_at,
    visits: {
      total: v.length, last30: last30.length,
      people30: new Set(last30.map((x) => x.visitor)).size,
      byDay: Object.entries(byDay).map(([date, n]) => ({ date, n })),
      pages: count(last30, (x) => pageOf(x.path)),
      sources: count(last30, (x) => x.ref || "Direct or typed in"),
      devices: count(last30, (x) => x.device || "unknown"),
      countries: count(last30, (x) => x.country || "unknown").slice(0, 8),
    },
    bookings: { total: confirmed.length, upcoming: upcoming.length, requests: b.filter((x) => x.kind === "request").length, paid: money(paidCents), people: new Set(confirmed.map((x) => x.visitor_email)).size },
  });
}
