import type { CandidHistoryMessage } from "@/lib/candid-api";
import { ensureCandidAccess } from "@/lib/candid/access";
import { sanitizeCandidReply } from "@/lib/candid/fallback";
import { normalizeSocialState } from "@/lib/candid/social-state";
import type { CandidSocialState } from "@/lib/candid/types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PersistedMessage = CandidHistoryMessage & {
  id: string;
  created_at?: string;
};

export async function getOrCreateCandidUser(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existing } = await supabaseAdmin
    .from("candid_users")
    .select("id")
    .eq("clerk_id", authId)
    .maybeSingle();

  if (existing) {
    await ensureCandidAccess(existing.id as string).catch(() => null);
    return existing;
  }

  const { data: created, error } = await supabaseAdmin
    .from("candid_users")
    .insert({ clerk_id: authId })
    .select("id")
    .single();

  if (error) throw error;
  await ensureCandidAccess(created.id as string).catch(() => null);
  return created!;
}

export async function fetchRecentMessages(input: {
  userId: string;
  limit?: number;
  before?: string | null;
}): Promise<PersistedMessage[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from("candid_messages")
      .select("id, role, content, created_at")
      .eq("user_id", input.userId)
      .is("deleted_at", null)
      .or("expires_at.is.null,expires_at.gt.now()")
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 80);

    if (input.before) {
      query = query.lt("created_at", input.before);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data
      .reverse()
      .map((item) => ({
        id: item.id as string,
        role: item.role as "user" | "ai",
        content: item.role === "ai" ? sanitizeCandidReply(item.content as string) : item.content as string,
        created_at: item.created_at as string,
      }));
  } catch (error) {
    console.error("Candid message fetch skipped:", error);
    return [];
  }
}

export async function clearCanonicalMessages(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin
      .from("candid_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null);
  } catch (error) {
    console.error("Candid message clear skipped:", error);
  }
}

export async function persistMessage(input: {
  userId: string;
  role: "user" | "ai";
  content: string;
  expiresInDays?: number;
}) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const content = input.role === "ai" ? sanitizeCandidReply(input.content) : input.content;
    const expiresAt = new Date(Date.now() + (input.expiresInDays ?? 21) * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("candid_messages")
      .insert({
        user_id: input.userId,
        role: input.role,
        content,
        expires_at: expiresAt,
      })
      .select("id, role, content, created_at")
      .single();

    if (error || !data) return null;

    return {
      id: data.id as string,
      role: data.role as "user" | "ai",
      content: data.content as string,
      created_at: data.created_at as string,
    };
  } catch (error) {
    console.error("Candid message persist skipped:", error);
    return null;
  }
}

export async function getSocialState(userId: string): Promise<CandidSocialState> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candid_social_state")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return normalizeSocialState(null);
    return normalizeSocialState(data.data);
  } catch (error) {
    console.error("Candid social state fetch skipped:", error);
    return normalizeSocialState(null);
  }
}

export async function saveSocialState(userId: string, socialState: CandidSocialState) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("candid_social_state").upsert(
      {
        user_id: userId,
        data: socialState,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch (error) {
    console.error("Candid social state save skipped:", error);
  }
}

export async function clearSocialState(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("candid_social_state").delete().eq("user_id", userId);
  } catch (error) {
    console.error("Candid social state clear skipped:", error);
  }
}
