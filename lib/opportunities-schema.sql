-- Opportunities, Phase 1: Sarah pastes a link, confirms the fields, publishes. Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.opportunities (
  id bigint generated always as identity primary key,
  slug text not null unique,                -- in the address: marquee.bio/opportunities/<slug>
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'draft',     -- draft | published | paused | closed
  featured boolean not null default false,
  title text not null,
  company text not null,
  company_url text,                         -- the company's own site
  company_blurb text,                       -- one line about the company, as the posting states it
  work_type text not null,                  -- full-time | fractional | advisory | project | contract | interim | board
  function text,                            -- marketing, growth, revenue, partnerships, operations, product, technology, ai, finance, people, strategy, other
  seniority text,                           -- executive | vp | director | senior | other
  location text,                            -- as written ("New York", "US")
  remote text,                              -- remote | hybrid | onsite | unknown
  pay_min integer,                          -- whole dollars, as posted
  pay_max integer,
  pay_per text,                             -- hour | month | year | project
  pay_note text,                            -- "+ equity", "DOE", or the pay as written when it does not fit the fields
  hours_per_week integer,
  start_text text,                          -- "November", "ASAP", as written
  length_text text,                         -- "6 months, renewable"
  description text,                         -- about the role, plain text
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  apply_url text not null,                  -- the original posting; "Apply on company site" goes here
  source text,                              -- where Sarah found it (site name)
  source_url text,                          -- the page she pasted
  deadline date,
  last_checked_at timestamptz,              -- weekly link check
  check_status text,                        -- ok | gone | error
  published_at timestamptz,
  closed_at timestamptz
);
create index if not exists opportunities_status on public.opportunities (status, published_at desc);
create index if not exists opportunities_type on public.opportunities (work_type);
alter table public.opportunities enable row level security;
create policy "Public can read published opportunities" on public.opportunities for select using (status = 'published');

-- what a member saved
create table if not exists public.saved_opportunities (
  user_id uuid not null,
  opportunity_id bigint not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);
alter table public.saved_opportunities enable row level security; -- no policies: only the server reads and writes
