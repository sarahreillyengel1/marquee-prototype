-- Code requests from marquee.bio/join ("Request your invite code"). Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.beta_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  linkedin text not null,                 -- LinkedIn profile link
  status text not null default 'pending', -- pending | approved | declined
  decided_at timestamptz,                 -- when Approve or Decline was clicked
  code_sent text                          -- the code that went out in the email, when approved
);
create index if not exists beta_requests_email on public.beta_requests (lower(email));
create index if not exists beta_requests_created on public.beta_requests (created_at desc);
alter table public.beta_requests enable row level security; -- no policies: only the server (service role) can read or write
