// Server-side reads for the board and its collection pages. Same columns the public API sends.
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";

export const PUBLIC_COLS = "id,slug,title,company,company_url,company_blurb,work_type,function,seniority,location,remote,pay_min,pay_max,pay_per,pay_note,hours_per_week,start_text,length_text,skills,source,featured,published_at,last_checked_at,deadline,require_marquee";

export async function loadPublished() {
  const db = createServerSupabase();
  const { data } = await db.from("opportunities").select(PUBLIC_COLS).eq("status", "published").order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(500);
  return data || [];
}
export async function loadViewer() {
  const me = await currentUserId();
  if (!me) return { signedIn: false, saved: [] as number[] };
  const { data } = await createServerSupabase().from("saved_opportunities").select("opportunity_id").eq("user_id", me);
  return { signedIn: true, saved: (data || []).map((x) => x.opportunity_id as number) };
}
