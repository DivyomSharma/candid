import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateCandidUser } from "@/lib/candid/persistence";
import { createEmptyMemory, normalizeMemory, calculateBadgeConfidences, normalizeBadge } from "@/lib/candid/memory";
import type { CandidProfileV4, CandidBadge } from "@/lib/candid/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      field?: string;
      value?: unknown;
      profileV4?: {
        currently?: Record<string, string>;
        tonight?: string[];
        shelf?: Array<{ key: string; value: string }>;
        openLoops?: Record<string, string>;
        smallThings?: string[];
        socialLinks?: Record<string, string>;
        photos?: string[];
        badges?: unknown[];
      };
    };

    const supabaseAdmin = getSupabaseAdmin();
    const user = await getOrCreateCandidUser(authId);

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    const updatedProfile: CandidProfileV4 = { ...memory.profileV4 } as CandidProfileV4;

    if (body.profileV4) {
      // Apply block updates (e.g. from editor)
      if (body.profileV4.currently) updatedProfile.currently = { ...updatedProfile.currently, ...body.profileV4.currently };
      if (body.profileV4.tonight) updatedProfile.tonight = body.profileV4.tonight;
      if (body.profileV4.shelf) updatedProfile.shelf = body.profileV4.shelf;
      if (body.profileV4.openLoops) updatedProfile.openLoops = { ...updatedProfile.openLoops, ...body.profileV4.openLoops };
      if (body.profileV4.smallThings) updatedProfile.smallThings = body.profileV4.smallThings;
      if (body.profileV4.socialLinks) updatedProfile.socialLinks = body.profileV4.socialLinks;
      if (body.profileV4.photos) updatedProfile.photos = body.profileV4.photos;
      if (body.profileV4.badges) {
        updatedProfile.badges = body.profileV4.badges.map(normalizeBadge).filter((x): x is CandidBadge => !!x);
      }
    } else if (body.field) {
      // Apply single field updates (e.g. from AI proposal tags)
      const parts = body.field.split(".");
      if (parts[0] === "currently" && parts[1]) {
        updatedProfile.currently = {
          ...updatedProfile.currently,
          [parts[1]]: body.value as string,
        };
      } else if (parts[0] === "openLoops" && parts[1]) {
        updatedProfile.openLoops = {
          ...updatedProfile.openLoops,
          [parts[1]]: body.value as string,
        };
      } else if (body.field === "tonight") {
        updatedProfile.tonight = body.value as string[];
      } else if (body.field === "shelf") {
        updatedProfile.shelf = body.value as Array<{ key: string; value: string }>;
      } else if (body.field === "smallThings") {
        updatedProfile.smallThings = body.value as string[];
      } else if (body.field === "socialLinks") {
        updatedProfile.socialLinks = body.value as Record<string, string>;
      } else if (body.field === "photos") {
        updatedProfile.photos = body.value as string[];
      } else if (body.field === "badges") {
        updatedProfile.badges = (Array.isArray(body.value) ? body.value : []).map(normalizeBadge).filter((x): x is CandidBadge => !!x);
      }
    }

    // Recompute badges based on updated profile V4 fields
    updatedProfile.badges = calculateBadgeConfidences({
      ...memory,
      profileV4: updatedProfile
    });

    const nextMemory = {
      ...memory,
      profileV4: updatedProfile,
    };

    await supabaseAdmin.from("candor_traits").upsert(
      { user_id: user.id, data: nextMemory },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ ok: true, profileV4: updatedProfile });
  } catch (error) {
    console.error("Profile update endpoint failed:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
