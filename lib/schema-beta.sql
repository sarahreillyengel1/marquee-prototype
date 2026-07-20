-- ════════════════════════════════════════════════════════════════════
-- Marquee — BETA MERGE migration
-- Adds everything the new profile design + updated questionnaire need.
-- Safe to run multiple times (idempotent). Run in the Supabase SQL editor.
-- Layered on top of lib/schema.sql — does NOT drop or alter existing data.
-- ════════════════════════════════════════════════════════════════════

-- ── generated_profiles: new fields the redesigned profile renders ──
alter table public.generated_profiles
  add column if not exists ways_to_work   jsonb   default '[]'::jsonb,  -- engagement storefront: [{key,title,icon,price,rateDisplay,flow,blurb,visible,order}]
  add column if not exists industries     text[]  default '{}',         -- powers hero + (later) recruiter search
  add column if not exists top_highlights jsonb   default '[]'::jsonb,  -- owner-chosen Top 3 trio, each can link out
  add column if not exists superpowers    jsonb   default '[]'::jsonb,  -- [{title,blurb,icon}]
  add column if not exists media          jsonb   default '[]'::jsonb,  -- gallery: [{type,title,url,image,source,internal}]
  add column if not exists portfolio      jsonb   default '[]'::jsonb,  -- project cases: [{id,title,type,image,metrics,body}]
  add column if not exists sections       jsonb   default '{}'::jsonb,  -- per-section visibility flags
  add column if not exists tags           text[]  default '{}',         -- hero tag chips
  add column if not exists available      boolean default true,
  add column if not exists available_label text,
  add column if not exists verified       boolean default false,
  add column if not exists work_locations text[]  default '{}',         -- persists the currently-discarded Work Preferences
  add column if not exists availability_note text;

-- ── work_history: per-company logo + curated content the timeline shows ──
alter table public.work_history
  add column if not exists logo_url   text,                 -- real company logo; green monogram is only the fallback
  add column if not exists highlights jsonb,                -- curated accomplishment bullets shown on the profile
  add column if not exists metrics    jsonb,                -- [{value,label}] metric chips
  add column if not exists badge      text,                 -- e.g. "Series C"
  add column if not exists verified   boolean default false;

-- ── storage bucket for company logos + media images (mirrors 'avatars') ──
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can read media') then
    create policy "Anyone can read media" on storage.objects
      for select using (bucket_id = 'media');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can upload own media') then
    create policy "Users can upload own media" on storage.objects
      for insert with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own media') then
    create policy "Users can update own media" on storage.objects
      for update using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete own media') then
    create policy "Users can delete own media" on storage.objects
      for delete using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;
