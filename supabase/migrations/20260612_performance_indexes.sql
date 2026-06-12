-- Performance & Vector Index Optimization for Candor (Phase 2)
-- Preparing for 10k -> 100k scale

-- 1. Optimize Vector Searches (HNSW is better than IVFFlat for scale)
-- Drop the old ivfflat index if it exists (schema.sql creates one by default)
DROP INDEX IF EXISTS candor_memory_embeddings_vector_idx;
CREATE INDEX IF NOT EXISTS candor_memory_embeddings_hnsw_idx ON public.candor_memory_embeddings USING hnsw (embedding vector_cosine_ops);

-- 2. Optimize Foreign Key & Query Performance
-- Profiles
CREATE INDEX IF NOT EXISTS candor_profiles_updated_at_idx ON public.candor_profiles (updated_at DESC);

-- Aligns
CREATE INDEX IF NOT EXISTS candor_alignments_score_idx ON public.candor_alignments (score DESC);

-- 3. Analyze tables to update query planner statistics
ANALYZE public.candor_profiles;
ANALYZE public.candor_messages;
ANALYZE public.candor_alignments;
ANALYZE public.candor_memory_events;
ANALYZE public.candor_memory_embeddings;
