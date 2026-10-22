-- Members' saved and applied opportunities (marquee.bio/analytics). Run once in Supabase: SQL Editor -> paste -> Run.
alter table public.saved_opportunities add column if not exists applied_at timestamptz; -- set when they press Apply
