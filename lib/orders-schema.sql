-- Sales from a member's Shop (and products on Social Links). Run once in Supabase: SQL Editor -> paste -> Run.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  username text not null,
  owner_id uuid not null,
  product_id text not null,
  product_title text not null,
  product_kind text,
  buyer_name text,
  buyer_email text not null,
  price_cents int not null default 0,
  fee_cents int not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending_payment',   -- pending_payment | paid | free | refunded | cancelled
  stripe_session_id text,
  stripe_payment_intent text,
  delivered_at timestamptz,
  refunded_at timestamptz,
  access_token text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);
create index if not exists orders_owner_idx on public.orders (owner_id, created_at desc);
create unique index if not exists orders_token_idx on public.orders (access_token);
alter table public.orders enable row level security; -- no policies: only the server reads or writes

-- Product files live in the private "products" bucket, under a folder named after the member's user id.
-- Members may upload, replace and remove their own files. Nobody can read them directly: the server
-- hands a buyer a short-lived link after payment.
create policy "Members upload their own product files" on storage.objects
  for insert with check (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Members replace their own product files" on storage.objects
  for update using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Members remove their own product files" on storage.objects
  for delete using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);
