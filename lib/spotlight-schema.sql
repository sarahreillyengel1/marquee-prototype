-- Items on marquee.bio/spotlight. Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.spotlight_items (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null,            -- article | opportunity | event | education | news
  kind text,                     -- Fractional, Board, In person, Workshop, ...
  title text not null,
  blurb text,
  url text,
  cta text,                      -- button label
  image_url text,
  org text,                      -- company, host or author
  detail text,                   -- "10 hrs a month · Start now"
  starts_at timestamptz,         -- events
  place text,                    -- events
  price text,                    -- events, education
  featured boolean not null default false,
  news boolean not null default false,
  published boolean not null default false,
  sort int not null default 0,
  source text                    -- "admin" or the feed it came from
);
alter table public.spotlight_items enable row level security; -- no policies: only the server can read or write
