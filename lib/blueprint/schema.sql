-- Career Blueprint storage. Run in the Supabase SQL editor.
-- Holds both in-progress sessions (saved answer-by-answer, keyed to name/email)
-- and finished results (shareable by their unguessable uuid).
--
-- If you already created an earlier version of this table, run the ALTER block
-- at the bottom instead of this CREATE.

create table if not exists blueprint_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text,
  email text,
  user_id uuid references auth.users(id) on delete set null,  -- null until signup
  answers jsonb not null default '{}'::jsonb,
  current_step int not null default 0,
  status text not null default 'in_progress',   -- 'in_progress' | 'complete'
  result jsonb,                                  -- null until generated
  model varchar,
  processing_ms int
);

alter table blueprint_results enable row level security;

-- Anyone with the (uuid) link can read — enables shareable results pages.
create policy "blueprint_results readable by id"
  on blueprint_results for select
  using (true);

-- Only the service role writes (the /api/blueprint* routes). No client inserts.

-- ── Upgrading an existing table (v1 → this) ──────────────────────────────
-- alter table blueprint_results
--   add column if not exists name text,
--   add column if not exists email text,
--   add column if not exists current_step int not null default 0,
--   add column if not exists status text not null default 'in_progress',
--   add column if not exists updated_at timestamptz not null default now();
-- alter table blueprint_results alter column result drop not null;
-- alter table blueprint_results alter column answers set default '{}'::jsonb;
