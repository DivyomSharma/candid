import { getPublicIdentityForCandorUserId, getPublicIdentitiesForCandorUserIds } from "@/lib/candor/identity";
import { buildCandorProfilePresentation } from "@/lib/candor/profile";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getOwnPublicProfile(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: user } = await supabaseAdmin.from("candor_users").select("id").eq("clerk_id", authId).maybeSingle();
  if (!user) return null;

  const identity = await getPublicIdentityForCandorUserId(user.id as string);
  const { data: traits } = await supabaseAdmin.from("candor_traits").select("data").eq("user_id", user.id).maybeSingle();

  return buildCandorProfilePresentation({
    memory: normalizeMemory(traits?.data ?? createEmptyMemory()),
    username: identity.username,
    handle: identity.handle,
  });
}

export async function getPublicProfileByHandle(handleParam: string) {
  const target = normalizeHandle(handleParam);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: users } = await supabaseAdmin.from("candor_users").select("id");
  const userIds = (users ?? []).map((row) => row.id as string);
  const identities = await getPublicIdentitiesForCandorUserIds(userIds);

  const userId = userIds.find((id) => normalizeHandle(identities.get(id)?.handle) === target);
  if (!userId) return null;

  const identity = identities.get(userId);
  const { data: traits } = await supabaseAdmin.from("candor_traits").select("data").eq("user_id", userId).maybeSingle();

  return buildCandorProfilePresentation({
    memory: normalizeMemory(traits?.data ?? createEmptyMemory()),
    username: identity?.username,
    handle: identity?.handle,
  });
}

export function normalizeHandle(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/^@/, "").trim();
}
