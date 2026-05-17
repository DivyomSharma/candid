import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CandorPersonalProfile = {
  username: string | null;
  displayName: string | null;
  dob: string | null;
  genderIdentity: string | null;
  city: string | null;
  relationshipPreference: string | null;
};

export const emptyCandorPersonalProfile: CandorPersonalProfile = {
  username: null,
  displayName: null,
  dob: null,
  genderIdentity: null,
  city: null,
  relationshipPreference: null,
};

export async function getCandorPersonalProfile(userId: string): Promise<CandorPersonalProfile> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("candor_profiles")
    .select("username, display_name, dob, gender_identity, city, relationship_preference")
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
    displayName: cleanText(readString(row.display_name), 42),
    dob: cleanDate(readString(row.dob)),
    genderIdentity: cleanText(readString(row.gender_identity), 42),
    city: cleanText(readString(row.city), 56),
    relationshipPreference: cleanText(readString(row.relationship_preference), 56),
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

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
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
