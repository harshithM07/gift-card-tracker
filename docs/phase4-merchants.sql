-- Phase 4.1: Merchant catalog + nullable merchant_id on gift_cards
-- Safe to run on an existing project.

begin;

-- 1) Canonical merchant catalog
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text null,
  brand_color text null,
  category text null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Link cards to canonical merchants when known (nullable fallback path)
alter table public.gift_cards
  add column if not exists merchant_id uuid null references public.merchants(id) on delete set null;

create index if not exists idx_gift_cards_merchant_id on public.gift_cards (merchant_id);

-- 3) Optional helper indexes for search/admin operations
create index if not exists idx_merchants_name on public.merchants (name);
create index if not exists idx_merchants_slug on public.merchants (slug);

-- 4) Seed a few common merchants (idempotent)
insert into public.merchants (name, slug, category, aliases)
values
  ('Amazon', 'amazon', 'Retail', '{"amazon.com"}'),
  ('Apple', 'apple', 'Electronics', '{"apple store"}'),
  ('Starbucks', 'starbucks', 'Coffee', '{"sbux"}'),
  ('Target', 'target', 'Retail', '{"target store"}')
on conflict (slug) do nothing;

-- 5) Best-effort backfill from existing gift_cards.merchant text
update public.gift_cards gc
set merchant_id = m.id
from public.merchants m
where gc.merchant_id is null
  and lower(trim(gc.merchant)) = lower(trim(m.name));

commit;

-- Notes:
-- - Keep gift_cards.merchant as the always-present display fallback.
-- - New cards may store both merchant (text) and merchant_id (nullable FK).
-- - Unknown merchants should use merchant_id = null and still function normally.
