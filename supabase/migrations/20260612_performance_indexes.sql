-- Performance & Vector Index Optimization for Candor (Phase 2)
-- Preparing for 10k -> 100k scale

-- 1. Optimize Vector Searches
-- Assuming we have an embedding column in candor_memories or candor_signals
-- We use hnsw for fast vector similarity search in pgvector
CREATE INDEX IF NOT EXISTS idx_candor_memories_embedding ON public.candor_memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_candor_signals_embedding ON public.candor_signals USING hnsw (embedding vector_cosine_ops);

-- 2. Optimize Foreign Key & Query Performance
-- Profiles
CREATE INDEX IF NOT EXISTS idx_candor_profiles_user_id ON public.candor_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_candor_profiles_updated_at ON public.candor_profiles (updated_at DESC);

-- Threads & Messages
CREATE INDEX IF NOT EXISTS idx_candor_messages_thread_id ON public.candor_messages (thread_id);
CREATE INDEX IF NOT EXISTS idx_candor_messages_created_at ON public.candor_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candor_threads_user_id ON public.candor_threads (user_id);

-- Aligns
CREATE INDEX IF NOT EXISTS idx_candor_aligns_user_id ON public.candor_aligns (user_id);
CREATE INDEX IF NOT EXISTS idx_candor_aligns_target_user_id ON public.candor_aligns (target_user_id);
CREATE INDEX IF NOT EXISTS idx_candor_aligns_score ON public.candor_aligns (score DESC);

-- 3. Analyze tables to update query planner statistics
ANALYZE public.candor_profiles;
ANALYZE public.candor_messages;
ANALYZE public.candor_threads;
ANALYZE public.candor_aligns;
ANALYZE public.candor_memories;
