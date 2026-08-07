import { createServerSupabase } from "@/lib/supabase";

export const metadata = { title: "Signups · Marquee", robots: { index: false } };
export const dynamic = "force-dynamic"; // always fresh, never cached

type Row = {
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  linkedin_url: string | null;
  notes: string | null;
  status: string | null;
  source: string | null;
};

const roleOf = (notes: string | null) => notes?.match(/role:\s*([A-Za-z]+)/i)?.[1] ?? "—";
const tally = (rows: Row[], pick: (r: Row) => string) => {
  const m: Record<string, number> = {};
  for (const r of rows) { const k = pick(r) || "—"; m[k] = (m[k] || 0) + 1; }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};

export default async function StatsPage({ searchParams }: { searchParams: { key?: string } }) {
  const expected = process.env.STATS_KEY;
  if (!expected || searchParams?.key !== expected) {
    return (
      <div className="min-h-screen bg-paper text-ink font-inter flex items-center justify-center p-6">
        <div className="text-center">
          <div className="font-lora text-[28px]">Private</div>
          <p className="text-[14px] text-ink/60 mt-2">Add <code>?key=…</code> to the URL to view.</p>
        </div>
      </div>
    );
  }

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("waitlist")
    .select("created_at, first_name, last_name, email, linkedin_url, notes, status, source")
    .order("created_at", { ascending: false });
  const rows = (data as Row[]) || [];

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const week = rows.filter((r) => r.created_at >= weekAgo).length;
  const day = rows.filter((r) => r.created_at >= new Date(Date.now() - 864e5).toISOString()).length;

  const stat = (v: number | string, l: string) => (
    <div className="border border-hair bg-white p-5">
      <div className="font-lora text-[38px] leading-none text-dred">{v}</div>
      <div className="text-[12px] uppercase tracking-[0.1em] text-ink/55 mt-2">{l}</div>
    </div>
  );
  const bars = (title: string, entries: [string, number][]) => (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-dred mb-3">{title}</div>
      <div className="space-y-2">
        {entries.map(([k, n]) => (
          <div key={k} className="flex items-center gap-3 text-[13px]">
            <span className="w-[110px] shrink-0 capitalize">{k}</span>
            <div className="flex-1 h-[8px] bg-beige"><div className="h-full bg-red" style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div>
            <span className="w-[36px] text-right tabular-nums text-ink/70">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink font-inter">
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <h1 className="font-lora text-[clamp(28px,4vw,44px)]">Signups</h1>
          <a href="https://vercel.com/sarahreillyengel1s-projects/marquee/analytics" target="_blank" rel="noopener" className="text-[13px] font-semibold text-dred hover:underline">Traffic → Vercel Analytics ↗</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {stat(total, "Total")}
          {stat(pending, "Pending")}
          {stat(approved, "Approved")}
          {stat(week, "Last 7 days")}
          {stat(day, "Last 24h")}
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {bars("By role", tally(rows, (r) => roleOf(r.notes)))}
          {bars("By source", tally(rows, (r) => r.source || "—"))}
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-dred mb-3 mt-12">Recent signups</div>
        <div className="overflow-x-auto border border-hair">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead>
              <tr className="bg-beige text-left text-[11px] uppercase tracking-[0.08em] text-ink/55">
                <th className="p-3">When</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">LinkedIn</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-hair">
                  <td className="p-3 whitespace-nowrap text-ink/60">{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="p-3 whitespace-nowrap">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="p-3"><a href={`mailto:${r.email}`} className="hover:text-dred">{r.email}</a></td>
                  <td className="p-3 capitalize">{roleOf(r.notes)}</td>
                  <td className="p-3">{r.linkedin_url ? <a href={r.linkedin_url} target="_blank" rel="noopener" className="text-dred hover:underline">profile ↗</a> : "—"}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="text-[14px] text-ink/50 mt-4">No signups yet.</p>}
      </div>
    </div>
  );
}
