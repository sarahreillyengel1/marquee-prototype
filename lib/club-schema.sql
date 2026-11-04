-- Applications from marquee.bio/future-worth-club ("Apply to join"). Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.club_applications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  link text not null,           -- LinkedIn or marquee.bio link
  instagram text,               -- optional
  why text,                     -- why they want to join
  status text not null default 'pending',  -- pending | approved | declined
  source text                   -- where the form was opened from (page path)
);
create index if not exists club_applications_email on public.club_applications (lower(email));
create index if not exists club_applications_created on public.club_applications (created_at desc);
alter table public.club_applications enable row level security; -- no policies: only the server (service role) can read or write
