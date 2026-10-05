-- Usage: which member a page visit belongs to, and a log of every email Marquee sends.
-- Run once in Supabase: SQL Editor -> paste -> Run.
alter table public.page_views add column if not exists member text;
create index if not exists page_views_member_idx on public.page_views (member, at desc);
create table if not exists public.email_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  to_email text not null,
  subject text not null,
  ok boolean not null default false,
  resend_id text,
  error text
);
create index if not exists email_log_at_idx on public.email_log (at desc);
alter table public.email_log enable row level security;
