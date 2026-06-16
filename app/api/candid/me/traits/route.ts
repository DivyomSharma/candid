import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getAlignmentPreview } from "@/lib/candid/alignment";
import { getCandidAccess, normalizeCandidAccess } from "@/lib/candid/access";
import { getPublicIdentityForCandidUserId } from "@/lib/candid/identity";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { emptyCandidPersonalProfile, getCandidPersonalProfile } from "@/lib/candid/personal-profile";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user } = await supabaseAdmin
      .from("candor_users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (!user) {
      const memory = createEmptyMemory();
      return NextResponse.json({
        memory,
        alignment: getAlignmentPreview(memory),
        identity: { username: null, handle: null },
        personalProfile: emptyCandidPersonalProfile,
        access: normalizeCandidAccess(null),
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    const identity = await getPublicIdentityForCandidUserId(user.id as string);
    const personalProfile = await getCandidPersonalProfile(user.id as string);
    const access = await getCandidAccess(user.id as string);

    return NextResponse.json({
      memory,
      alignment: getAlignmentPreview(memory),
      identity,
      personalProfile,
      access,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Traits fetch failed:", error);
    const memory = createEmptyMemory();
    return NextResponse.json({
      memory,
      alignment: getAlignmentPreview(memory),
      identity: { username: null, handle: null },
      personalProfile: emptyCandidPersonalProfile,
      access: normalizeCandidAccess(null),
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
