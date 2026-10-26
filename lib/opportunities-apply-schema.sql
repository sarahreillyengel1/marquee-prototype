-- Applications sent through Marquee (Apply here on a listing). Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.applications (
  id bigint generated always as identity primary key,
  opportunity_id bigint not null references public.opportunities(id) on delete cascade,
  user_id uuid,                 -- the member, when signed in
  name text not null,
  email text not null,
  marquee_url text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security; -- no policies: only the server reads and writes
