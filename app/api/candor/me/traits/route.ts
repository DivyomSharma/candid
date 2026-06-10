import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getAlignmentPreview } from "@/lib/candor/alignment";
import { getCandorAccess, normalizeCandorAccess } from "@/lib/candor/access";
import { getPublicIdentityForCandorUserId } from "@/lib/candor/identity";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { emptyCandorPersonalProfile, getCandorPersonalProfile } from "@/lib/candor/personal-profile";
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
        personalProfile: emptyCandorPersonalProfile,
        access: normalizeCandorAccess(null),
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    const identity = await getPublicIdentityForCandorUserId(user.id as string);
    const personalProfile = await getCandorPersonalProfile(user.id as string);
    const access = await getCandorAccess(user.id as string);

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
      personalProfile: emptyCandorPersonalProfile,
      access: normalizeCandorAccess(null),
    }, { headers: { "Cache-Control": "no-store" } });
  }
}
