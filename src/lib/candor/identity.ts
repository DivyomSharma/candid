import { clerkClient } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PublicCandorIdentity = {
  username: string | null;
  handle: string | null;
};

type AuthMetadata = {
  username?: unknown;
  user_name?: unknown;
  preferred_username?: unknown;
  display_name?: unknown;
  full_name?: unknown;
  name?: unknown;
};

export async function getPublicIdentityForCandorUserId(userId: string): Promise<PublicCandorIdentity> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from("candor_users").select("clerk_id").eq("id", userId).maybeSingle();
  const authId = data?.clerk_id;

  if (!authId) return { username: null, handle: null };
  return getPublicIdentityFromAuthId(authId);
}

export async function getPublicIdentitiesForCandorUserIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)];
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from("candor_users").select("id, clerk_id").in("id", uniqueIds);

  const entries = await Promise.all(
    (data ?? []).map(async (row) => [row.id as string, await getPublicIdentityFromAuthId(row.clerk_id as string)] as const),
  );

  return new Map(entries);
}

async function getPublicIdentityFromAuthId(authId: string): Promise<PublicCandorIdentity> {
  if (isUuid(authId)) return getSupabaseIdentity(authId);
  if (authId.startsWith("user_")) return getClerkIdentity(authId);
  return { username: null, handle: null };
}

async function getSupabaseIdentity(authId: string): Promise<PublicCandorIdentity> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(authId);
  if (error || !data.user) return { username: null, handle: null };

  const metadata = data.user.user_metadata as AuthMetadata;
  const explicitUsername = firstString(metadata.username, metadata.user_name, metadata.preferred_username);
  const displayName = firstString(
    explicitUsername,
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    emailName(data.user.email),
  );

  return {
    username: cleanDisplayName(displayName),
    handle: handleFrom(explicitUsername ?? emailName(data.user.email) ?? displayName),
  };
}

async function getClerkIdentity(authId: string): Promise<PublicCandorIdentity> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(authId);
    const email = user.primaryEmailAddress?.emailAddress;
    const displayName = firstString(
      user.username,
      user.fullName,
      [user.firstName, user.lastName].filter(Boolean).join(" "),
      emailName(email),
    );

    return {
      username: cleanDisplayName(displayName),
      handle: handleFrom(user.username ?? emailName(email) ?? displayName),
    };
  } catch {
    return { username: null, handle: null };
  }
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

function cleanDisplayName(value: string | null) {
  if (!value) return null;
  return value.replace(/\s+/g, " ").trim().slice(0, 42);
}

function emailName(email: string | null | undefined) {
  return email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? null;
}

function handleFrom(value: string | null) {
  if (!value) return null;
  const handle = value
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 32);

  return handle ? `@${handle}` : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
