import { clerkClient } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getCandorPersonalProfile, handleFromUsername } from "@/lib/candor/personal-profile";

export type PublicCandorIdentity = {
  username: string | null;
  handle: string | null;
  age: number | null;
  district: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  dob: string | null;
  coverUrl: string | null;
  identityChips: string[];
  candorBadge: unknown | null;
  objects: unknown[];
  photos: unknown[];
  shelfItems: unknown[];
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
  const [{ data: user }, { data: profile }] = await Promise.all([
    supabaseAdmin.from("candor_users").select("clerk_id").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("candor_profiles").select("user_id, username, display_name, dob, district, city, lat, lon, cover_url, identity_chips, candor_badge, objects, photos, shelf_items").eq("user_id", userId).maybeSingle(),
  ]);

  const authId = user?.clerk_id;

  if (profile) {
    const profileIdentity = publicIdentityFromProfile(profile);
    if (profileIdentity) return profileIdentity;
  }

  if (!authId) return { username: null, handle: null, age: null, district: null, city: null, lat: null, lon: null, dob: null, coverUrl: null, identityChips: [], candorBadge: null, objects: [], photos: [], shelfItems: [] };
  return getPublicIdentityFromAuthId(authId);
}

export async function getPublicIdentitiesForCandorUserIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return new Map<string, PublicCandorIdentity>();

  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: users }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from("candor_users").select("id, clerk_id").in("id", uniqueIds),
    supabaseAdmin.from("candor_profiles").select("user_id, username, display_name, dob, district, city, lat, lon, cover_url, identity_chips, candor_badge, objects, photos, shelf_items").in("user_id", uniqueIds),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((row) => [row.user_id as string, publicIdentityFromProfile(row)] as const),
  );

  const entries = await Promise.all(
    (users ?? []).map(async (row) => {
      const userId = row.id as string;
      const profileIdentity = profileMap.get(userId);
      if (profileIdentity) return [userId, profileIdentity] as const;
      return [userId, await getPublicIdentityFromAuthId(row.clerk_id as string)] as const;
    }),
  );

  return new Map(entries);
}

async function getPublicIdentityFromAuthId(authId: string): Promise<PublicCandorIdentity> {
  if (isUuid(authId)) return getSupabaseIdentity(authId);
  if (authId.startsWith("user_")) return getClerkIdentity(authId);
  return { username: null, handle: null, age: null, district: null, city: null, lat: null, lon: null, dob: null, coverUrl: null, identityChips: [], candorBadge: null, objects: [], photos: [], shelfItems: [] };
}

async function getSupabaseIdentity(authId: string): Promise<PublicCandorIdentity> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(authId);
  if (error || !data.user) return { username: null, handle: null, age: null, district: null, city: null, lat: null, lon: null, dob: null, coverUrl: null, identityChips: [], candorBadge: null, objects: [], photos: [], shelfItems: [] };

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
    age: null,
    district: null,
    city: null,
    lat: null,
    lon: null,
    dob: null,
    coverUrl: null,
    identityChips: [],
    candorBadge: null,
    objects: [],
    photos: [],
    shelfItems: [],
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
      age: null,
      district: null,
      city: null,
      lat: null,
      lon: null,
      dob: null,
      coverUrl: null,
      identityChips: [],
      candorBadge: null,
      objects: [],
      photos: [],
      shelfItems: [],
    };
  } catch {
    return { username: null, handle: null, age: null, district: null, city: null, lat: null, lon: null, dob: null, coverUrl: null, identityChips: [], candorBadge: null, objects: [], photos: [], shelfItems: [] };
  }
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

function cleanDisplayName(value: string | null) {
  if (!value) return null;
  return value.replace(/\s+/g, " ").trim().slice(0, 42);
}

function calculateAge(dobStr: string | null) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function publicIdentityFromProfile(profile: Record<string, unknown>) {
  const username = firstString(profile?.username);
  const displayName = firstString(profile?.display_name, username);
  const handle = handleFromUsername(username ?? displayName);
  if (!displayName && !handle) return null;

  return {
    username: cleanDisplayName(displayName),
    handle,
    age: calculateAge(typeof profile?.dob === "string" ? profile.dob : null),
    district: typeof profile?.district === "string" ? profile.district : null,
    city: typeof profile?.city === "string" ? profile.city : null,
    lat: typeof profile?.lat === "number" ? profile.lat : null,
    lon: typeof profile?.lon === "number" ? profile.lon : null,
    dob: typeof profile?.dob === "string" ? profile.dob : null,
    coverUrl: typeof profile?.cover_url === "string" ? profile.cover_url : null,
    identityChips: Array.isArray(profile?.identity_chips) ? profile.identity_chips : [],
    candorBadge: profile?.candor_badge as unknown,
    objects: Array.isArray(profile?.objects) ? profile.objects : [],
    photos: Array.isArray(profile?.photos) ? profile.photos : [],
    shelfItems: Array.isArray(profile?.shelf_items) ? profile.shelf_items : [],
  } satisfies PublicCandorIdentity;
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
