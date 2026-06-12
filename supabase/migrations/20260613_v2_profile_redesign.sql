-- V2 Profile Redesign: Room & Shelf data structures
alter table public.candor_profiles
  add column if not exists district text,
  add column if not exists state text,
  add column if not exists country text,
  add column if not exists lat double precision,
  add column if not exists lon double precision,
  add column if not exists timezone text,
  
  add column if not exists cover_url text,
  add column if not exists identity_chips text[],
  
  -- JSON structures
  add column if not exists candor_badge jsonb,
  add column if not exists objects jsonb default '[]'::jsonb,
  add column if not exists photos jsonb default '[]'::jsonb,
  add column if not exists shelf_items jsonb default '[]'::jsonb;
