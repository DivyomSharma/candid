create table if not exists public.candor_users (
  id uuid primary key default gen_random_uuid(),
  -- Stores Supabase auth.users.id. The column name is kept for existing deployments.
  clerk_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_traits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candor_users enable row level security;
alter table public.candor_traits enable row level security;
