import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 * Use this in API routes for full read/write access to all tables
 * (bypasses Row Level Security).
 */
// Supabase's generic database type is intentionally loose here because this app
// uses hand-written SQL instead of generated Supabase types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any, "public", any> | null = null;

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("missing_supabase_env");
  }

  adminClient ??= createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return adminClient;
}
