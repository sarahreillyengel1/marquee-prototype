-- Opportunities, posting: companies can post their own role (marquee.bio/opportunities/post). Sarah reviews before it goes live.
-- Run once in Supabase: SQL Editor -> paste -> Run.
alter table public.opportunities
  add column if not exists posted_by uuid,                                   -- the hiring account that posted it (null = Sarah added it)
  add column if not exists poster_email text,                                -- their work email, for the review and the "it's live" note
  add column if not exists poster_name text,
  add column if not exists require_marquee text not null default 'optional'; -- yes | optional
create index if not exists opportunities_posted_by on public.opportunities (posted_by);
