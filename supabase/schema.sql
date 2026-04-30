create table if not exists public.candor_users (
  id uuid primary key default gen_random_uuid(),
  -- Stores Supabase auth.users.id. The column name is kept for existing deployments.
  clerk_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.candor_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_traits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candor_conversations_user_id_created_at_idx
  on public.candor_conversations(user_id, created_at desc);

create index if not exists candor_messages_conversation_id_created_at_idx
  on public.candor_messages(conversation_id, created_at asc);

alter table public.candor_users enable row level security;
alter table public.candor_conversations enable row level security;
alter table public.candor_messages enable row level security;
alter table public.candor_traits enable row level security;
