import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CandorPersonalProfile = {
  username: string | null;
  displayName: string | null;
  dob: string | null;
  genderIdentity: string | null;
  city: string | null;
  relationshipPreference: string | null;
  shortBio: string | null;
  occupation: string | null;
  education: string | null;
  
  // V2 Fields
  district: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  coverUrl: string | null;
  identityChips: string[];
  candorBadge: unknown | null;
  objects: unknown[];
  photos: unknown[];
  shelfItems: unknown[];
};

export const emptyCandorPersonalProfile: CandorPersonalProfile = {
  username: null,
  displayName: null,
  dob: null,
  genderIdentity: null,
  city: null,
  relationshipPreference: null,
  shortBio: null,
  occupation: null,
  education: null,
  district: null,
  state: null,
  country: null,
  lat: null,
  lon: null,
  timezone: null,
  coverUrl: null,
  identityChips: [],
  candorBadge: null,
  objects: [],
  photos: [],
  shelfItems: [],
};

export async function getCandorPersonalProfile(userId: string): Promise<CandorPersonalProfile> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("candor_profiles")
    .select("username, display_name, dob, gender_identity, city, district, state, country, lat, lon, timezone, cover_url, identity_chips, candor_badge, objects, photos, shelf_items, relationship_preference, short_bio, occupation, education")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizeCandorPersonalProfile(data);
}

export async function upsertCandorPersonalProfile(userId: string, profile: CandorPersonalProfile) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("candor_profiles").upsert(
    {
      user_id: userId,
      username: cleanUsername(profile.username),
      display_name: cleanText(profile.displayName, 42),
      dob: cleanDate(profile.dob),
      gender_identity: cleanText(profile.genderIdentity, 42),
      city: cleanText(profile.city, 56),
      relationship_preference: cleanText(profile.relationshipPreference, 56),
      short_bio: cleanText(profile.shortBio, 120),
      occupation: cleanText(profile.occupation, 56),
      education: cleanText(profile.education, 56),
      district: cleanText(profile.district, 56),
      state: cleanText(profile.state, 56),
      country: cleanText(profile.country, 56),
      lat: profile.lat,
      lon: profile.lon,
      timezone: cleanText(profile.timezone, 56),
      cover_url: profile.coverUrl,
      identity_chips: profile.identityChips,
      candor_badge: profile.candorBadge,
      objects: profile.objects,
      photos: profile.photos,
      shelf_items: profile.shelfItems,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export function normalizeCandorPersonalProfile(value: unknown): CandorPersonalProfile {
  if (!value || typeof value !== "object") return emptyCandorPersonalProfile;
  const row = value as Record<string, unknown>;

  return {
    username: cleanUsername(readString(row.username)) ?? null,
    displayName: cleanText(readString(row.display_name, row.displayName), 42),
    dob: cleanDate(readString(row.dob)),
    genderIdentity: cleanText(readString(row.gender_identity, row.genderIdentity), 42),
    city: cleanText(readString(row.city), 56),
    relationshipPreference: cleanText(readString(row.relationship_preference, row.relationshipPreference), 56),
    shortBio: cleanText(readString(row.short_bio, row.shortBio), 120),
    occupation: cleanText(readString(row.occupation), 56),
    education: cleanText(readString(row.education), 56),
    district: cleanText(readString(row.district), 56),
    state: cleanText(readString(row.state), 56),
    country: cleanText(readString(row.country), 56),
    lat: typeof row.lat === "number" ? row.lat : null,
    lon: typeof row.lon === "number" ? row.lon : null,
    timezone: cleanText(readString(row.timezone), 56),
    coverUrl: cleanText(readString(row.cover_url, row.coverUrl), 500),
    identityChips: Array.isArray(row.identity_chips) ? row.identity_chips : Array.isArray(row.identityChips) ? row.identityChips : [],
    candorBadge: row.candor_badge ?? row.candorBadge ?? null,
    objects: Array.isArray(row.objects) ? row.objects : [],
    photos: Array.isArray(row.photos) ? row.photos : [],
    shelfItems: Array.isArray(row.shelf_items) ? row.shelf_items : Array.isArray(row.shelfItems) ? row.shelfItems : [],
  };
}

export function handleFromUsername(username: string | null | undefined) {
  const normalized = cleanUsername(username);
  return normalized ? `@${normalized}` : null;
}

export function ageFromDob(dob: string | null | undefined) {
  if (!dob) return null;
  const date = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - date.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }

  return age >= 0 && age < 130 ? age : null;
}

function readString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string") ?? null;
}

function cleanText(value: string | null | undefined, maxLength: number) {
  const cleaned = value?.trim().replace(/\s+/g, " ").slice(0, maxLength) ?? "";
  return cleaned || null;
}

function cleanDate(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function cleanUsername(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 32);

  return cleaned || null;
}
