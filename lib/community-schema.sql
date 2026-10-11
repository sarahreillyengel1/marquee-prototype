-- Answers from marquee.bio/community-feedback ("Get to Know You"). Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.community_responses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  linkedin text not null,  -- LinkedIn profile link
  background text,      -- 1. about yourself and your professional background
  challenges text,      -- 2. biggest professional challenges
  curious text,         -- 3. most curious about Marquee
  anything text,        -- 4. anything else
  source text           -- where the form was opened from (page path)
);
create index if not exists community_responses_email on public.community_responses (lower(email));
create index if not exists community_responses_created on public.community_responses (created_at desc);
alter table public.community_responses enable row level security; -- no policies: only the server (service role) can read or write
