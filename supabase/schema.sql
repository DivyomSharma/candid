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

create table if not exists public.candor_alignments (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.candor_users(id) on delete cascade,
  user_b_id uuid not null references public.candor_users(id) on delete cascade,
  score integer not null default 0,
  user_a_dm_enabled boolean not null default false,
  user_b_dm_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candor_alignments_distinct_users check (user_a_id <> user_b_id),
  constraint candor_alignments_unique_pair unique (user_a_id, user_b_id)
);

create table if not exists public.candor_dm_messages (
  id uuid primary key default gen_random_uuid(),
  alignment_id uuid not null references public.candor_alignments(id) on delete cascade,
  sender_id uuid not null references public.candor_users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.candor_users(id) on delete set null,
  trait_cluster text not null,
  choice_pattern text,
  insight_type text,
  accepted boolean,
  engagement_signal text not null,
  created_at timestamptz not null default now()
);

create index if not exists candor_alignments_user_a_idx on public.candor_alignments(user_a_id);
create index if not exists candor_alignments_user_b_idx on public.candor_alignments(user_b_id);
create index if not exists candor_dm_messages_alignment_created_at_idx
  on public.candor_dm_messages(alignment_id, created_at asc);
create index if not exists candor_learning_events_trait_cluster_created_at_idx
  on public.candor_learning_events(trait_cluster, created_at desc);

alter table public.candor_users enable row level security;
alter table public.candor_traits enable row level security;
alter table public.candor_alignments enable row level security;
alter table public.candor_dm_messages enable row level security;
alter table public.candor_learning_events enable row level security;
