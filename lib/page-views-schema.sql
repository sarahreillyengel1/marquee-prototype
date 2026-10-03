-- Site visits, counted by Marquee itself (no cookies, no outside tracker).
-- Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  path text not null,
  profile text,          -- the member's username when the page is a profile
  ref text,              -- the site the visitor came from, e.g. "linkedin.com"
  device text,           -- "phone" or "computer"
  country text,
  visitor text           -- a code that changes every day; counts people without identifying them
);
create index if not exists page_views_at_idx on public.page_views (at desc);
create index if not exists page_views_profile_idx on public.page_views (profile, at desc);
alter table public.page_views enable row level security; -- no policies: only the server can read or write
