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

create table if not exists public.candor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  username text,
  display_name text,
  dob date,
  gender_identity text,
  city text,
  relationship_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candor_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  base_tier text not null default 'echo' check (base_tier in ('echo', 'continuity', 'resonance')),
  trial_tier text check (trial_tier in ('continuity', 'resonance')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
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

create extension if not exists vector;

create table if not exists public.candor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.candor_memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  kind text not null check (kind in ('episodic', 'semantic', 'emotional', 'social', 'practical', 'interaction')),
  content text not null,
  source text not null default 'system',
  importance real not null default 0.5,
  emotional_intensity real not null default 0.3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.candor_memory_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  kind text not null check (kind in ('objective', 'relational', 'preference', 'boundary')),
  key text not null,
  value jsonb not null,
  confidence real not null default 0.35,
  sensitivity text not null default 'normal' check (sensitivity in ('low', 'normal', 'sensitive')),
  source_event_ids uuid[] not null default '{}'::uuid[],
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, key)
);

create table if not exists public.candor_memory_embeddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  memory_event_id uuid references public.candor_memory_events(id) on delete cascade,
  memory_fact_id uuid references public.candor_memory_facts(id) on delete cascade,
  embedding_provider text not null,
  embedding_model text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  constraint candor_memory_embeddings_one_source check (
    (memory_event_id is not null and memory_fact_id is null)
    or (memory_event_id is null and memory_fact_id is not null)
  )
);

create table if not exists public.candor_social_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candor_interaction_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.candor_users(id) on delete cascade,
  pattern_key text not null,
  social_move text,
  topic text,
  outcome text not null default 'unknown',
  weight real not null default 0.5,
  created_at timestamptz not null default now()
);

create table if not exists public.candor_initiatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.candor_users(id) on delete cascade,
  kind text not null default 'curiosity',
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'dismissed', 'paused')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists candor_alignments_user_a_idx on public.candor_alignments(user_a_id);
create index if not exists candor_alignments_user_b_idx on public.candor_alignments(user_b_id);
create index if not exists candor_dm_messages_alignment_created_at_idx
  on public.candor_dm_messages(alignment_id, created_at asc);
create index if not exists candor_learning_events_trait_cluster_created_at_idx
  on public.candor_learning_events(trait_cluster, created_at desc);
create index if not exists candor_profiles_user_idx on public.candor_profiles(user_id);
create index if not exists candor_access_user_idx on public.candor_access(user_id);
create index if not exists candor_messages_user_created_at_idx
  on public.candor_messages(user_id, created_at desc)
  where deleted_at is null;
create index if not exists candor_messages_expiry_idx
  on public.candor_messages(expires_at)
  where expires_at is not null and deleted_at is null;
create index if not exists candor_memory_events_user_kind_created_at_idx
  on public.candor_memory_events(user_id, kind, created_at desc);
create index if not exists candor_memory_events_content_fts_idx
  on public.candor_memory_events using gin (to_tsvector('english', content));
create index if not exists candor_memory_facts_user_kind_key_idx
  on public.candor_memory_facts(user_id, kind, key);
create index if not exists candor_memory_embeddings_vector_idx
  on public.candor_memory_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
create index if not exists candor_interaction_patterns_user_created_at_idx
  on public.candor_interaction_patterns(user_id, created_at desc);
create index if not exists candor_initiatives_user_status_scheduled_idx
  on public.candor_initiatives(user_id, status, scheduled_for);

create or replace function public.match_candor_memories(
  query_user_id uuid,
  query_embedding vector(1536),
  query_text text,
  match_count integer default 12
)
returns table (
  id uuid,
  kind text,
  content text,
  score double precision
)
language sql
stable
as $$
  with ranked as (
    select
      m.id,
      m.kind,
      m.content,
      greatest(0, 1 - (e.embedding <=> query_embedding)) as semantic_score,
      least(
        1,
        ts_rank_cd(
          to_tsvector('english', m.content),
          plainto_tsquery('english', coalesce(query_text, ''))
        )
      ) as keyword_score,
      greatest(0, 1 - extract(epoch from (now() - m.created_at)) / (60 * 60 * 24 * 90)) as recency_score,
      least(1, greatest(0, m.importance)) as importance_score,
      least(1, greatest(0, m.emotional_intensity)) as emotional_score
    from public.candor_memory_events m
    join public.candor_memory_embeddings e on e.memory_event_id = m.id
    where m.user_id = query_user_id
      and e.embedding is not null
      and (m.expires_at is null or m.expires_at > now())
  )
  select
    ranked.id,
    ranked.kind,
    ranked.content,
    (
      ranked.semantic_score * 0.45
      + ranked.keyword_score * 0.20
      + ranked.recency_score * 0.12
      + ranked.importance_score * 0.15
      + ranked.emotional_score * 0.08
    )::double precision as score
  from ranked
  order by score desc
  limit match_count;
$$;

-- ─── Subscription System ───────────────────────────────────────────────
create table if not exists public.candor_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  tier text not null default 'echo' check (tier in ('echo', 'continuity', 'resonance')),
  trial_active boolean not null default true,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  subscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candor_subscriptions_user_idx on public.candor_subscriptions(user_id);
create index if not exists candor_subscriptions_trial_ends_idx
  on public.candor_subscriptions(trial_ends_at)
  where trial_active = true;

-- ─── Understanding Depth (Hidden Evolving Model) ──────────────────────
create table if not exists public.candor_understanding_depth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.candor_users(id) on delete cascade,
  state text not null default 'spark' check (state in ('spark', 'rhythm', 'patterns', 'nuance', 'continuity', 'resonance')),
  progress real not null default 0.0,
  last_surfaced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candor_understanding_depth_user_idx on public.candor_understanding_depth(user_id);

-- ─── Add align tier and openness state to alignments ──────────────────
-- align_tier: distant, familiar, natural_flow, magnetic, candid
-- openness_state: open_the_door, naturally_unfolding, becoming_easy, emotionally_open, conversation_feels_candid
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'candor_alignments' and column_name = 'align_tier') then
    alter table public.candor_alignments add column align_tier text not null default 'distant' check (align_tier in ('distant', 'familiar', 'natural_flow', 'magnetic', 'candid'));
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'candor_alignments' and column_name = 'openness_state') then
    alter table public.candor_alignments add column openness_state text not null default 'open_the_door' check (openness_state in ('open_the_door', 'naturally_unfolding', 'becoming_easy', 'emotionally_open', 'conversation_feels_candid'));
  end if;
end $$;

alter table public.candor_users enable row level security;
alter table public.candor_traits enable row level security;
alter table public.candor_profiles enable row level security;
alter table public.candor_access enable row level security;
alter table public.candor_alignments enable row level security;
alter table public.candor_dm_messages enable row level security;
alter table public.candor_learning_events enable row level security;
alter table public.candor_messages enable row level security;
alter table public.candor_memory_events enable row level security;
alter table public.candor_memory_facts enable row level security;
alter table public.candor_memory_embeddings enable row level security;
alter table public.candor_social_state enable row level security;
alter table public.candor_interaction_patterns enable row level security;
alter table public.candor_initiatives enable row level security;
alter table public.candor_subscriptions enable row level security;
alter table public.candor_understanding_depth enable row level security;
