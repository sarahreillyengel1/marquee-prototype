-- Search index for Find an Expert and the Opportunities box. Run once in Supabase: SQL Editor -> paste -> Run.
--
-- Two tables.
--   search_index    one row per published professional, one per published opportunity. What a result card shows,
--                   the text search runs over, and the facets a search can filter on. Hidden-section data sits in
--                   private_* columns: it can match, it is never returned to a browser.
--   search_evidence one row per piece of evidence on a professional's storefront: a role, a result, a course,
--                   a newsletter, a talk, a board seat, a testimonial, with the topics it supports. The Why on a
--                   result card is written from these rows, by name.
--
-- No public read on either table. Every read goes through a server route.

-- Postgres only allows immutable functions in a generated column; array_to_string is not marked immutable, so wrap it.
create or replace function public.search_join(text[]) returns text language sql immutable as $$ select coalesce(array_to_string($1, ' '), '') $$;

create table if not exists public.search_index (
  id bigint generated always as identity primary key,
  kind text not null,                               -- professional | opportunity
  username text unique,                             -- the member (null for an opportunity)
  user_id uuid,
  opportunity_id bigint unique,                     -- the role (null for a member)
  title text not null default '',                   -- name, or role title
  subtitle text not null default '',                -- headline, or company
  body text not null default '',                    -- public text the search runs over
  private_body text not null default '',            -- text from hidden sections: matchable, never returned
  facets jsonb not null default '{}'::jsonb,        -- public filterable facts
  private_facets jsonb not null default '{}'::jsonb,-- hidden or search-only facts (MBTI, open to full-time, hidden sections)
  card jsonb not null default '{}'::jsonb,          -- what the result card shows; the page never reads the profile blob
  evidence_count integer not null default 0,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  indexed_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(body,'') || ' ' || coalesce(private_body,''))) stored
);
create index if not exists search_index_fts on public.search_index using gin (fts);
create index if not exists search_index_facets on public.search_index using gin (facets jsonb_path_ops);
create index if not exists search_index_kind on public.search_index (kind, published_at desc);
alter table public.search_index enable row level security;

create table if not exists public.search_evidence (
  id bigint generated always as identity primary key,
  index_id bigint not null references public.search_index(id) on delete cascade,
  username text not null,
  user_id uuid,
  kind text not null,          -- did_it | got_results | taught_it | wrote_or_spoke | was_asked | others_say | has_audience | credential | offer | claim
  page text not null,          -- profile | experience | media | shop | workwith | testimonials | reach | education
  item_id text,                -- the item's id inside the profile (r0, m2, pr1), when it has one
  title text not null default '',
  body text not null default '',   -- the member's own words for this item
  date_text text,              -- as written ("2023 – Present")
  source text,                 -- company, outlet, who said it
  url text,
  topics text[] not null default '{}',   -- extracted once by Claude, in lowercase, reused while the item is unchanged
  hash text not null,          -- sha1 of kind|page|title|body: unchanged item = reuse its topics
  hidden boolean not null default false, -- from a section the member hid: can match, never shown
  weight smallint not null default 1,    -- evidence strength: 1 claim ... 5 did it with a result
  created_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title,'') || ' ' || coalesce(body,'') || ' ' || coalesce(source,'') || ' ' || public.search_join(topics))) stored
);
create index if not exists search_evidence_index on public.search_evidence (index_id);
create index if not exists search_evidence_username on public.search_evidence (username);
create index if not exists search_evidence_fts on public.search_evidence using gin (fts);
create index if not exists search_evidence_topics on public.search_evidence using gin (topics);
create index if not exists search_evidence_kind on public.search_evidence (kind);
alter table public.search_evidence enable row level security;
