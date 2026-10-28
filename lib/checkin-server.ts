import type { SupabaseClient } from "@supabase/supabase-js";

// "How is it going?" is asked on a member's 2nd and 5th visit. A visit is a day they opened Marquee
// signed in (page_views rows carry the member id). Someone already past their 2nd visit when the
// check-in went live is counted from that day, so they are still asked on the 2nd and 5th from now.
export const ASKS = [2, 5] as const;
export type Ask = (typeof ASKS)[number];

const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

/** Which ask is due for this member right now, or 0. */
export async function checkinDue(db: SupabaseClient, userId: string): Promise<{ due: 0 | Ask; visits: number }> {
  const [{ data: settings }, { data: views }, { data: answered }] = await Promise.all([
    db.from("checkin_settings").select("started_at").eq("id", 1).maybeSingle(),
    db.from("page_views").select("at").eq("member", userId).order("at", { ascending: false }).limit(3000),
    db.from("checkins").select("ask").eq("user_id", userId),
  ]);
  if (!settings) return { due: 0, visits: 0 }; // the SQL has not been run yet: ask nobody
  const started = new Date(settings.started_at).getTime();
  const before = new Set<string>(), since = new Set<string>();
  for (const v of views || []) (new Date(v.at).getTime() < started ? before : since).add(dayOf(v.at));
  since.add(dayOf(new Date().toISOString())); // today counts, whether or not this page's view has landed yet
  const visits = before.size >= 2 ? since.size : before.size + since.size;
  const done = new Set((answered || []).map((a) => a.ask));
  const due: 0 | Ask = visits >= 5 && !done.has(5) ? 5 : visits >= 2 && !done.has(2) && !done.has(5) ? 2 : 0;
  return { due, visits };
}
