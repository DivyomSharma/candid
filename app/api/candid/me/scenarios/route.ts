import { NextResponse } from "next/server";
import { generateCandidScenarios, fallbackScenarios } from "@/lib/candid/scenarios";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { scenarios: fallbackScenarios().scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user } = await supabaseAdmin
      .from("candid_users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { scenarios: fallbackScenarios().scenarios },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: traits } = await supabaseAdmin
      .from("candid_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    
    // Fallback immediately if memory is empty
    if (!memory.values.length && !memory.softSpots.length && !memory.relationalPatterns.length && !memory.communicationNeeds.length && !memory.lifeThemes.length) {
      return NextResponse.json(
        { scenarios: fallbackScenarios().scenarios },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const payload = await generateCandidScenarios(memory);
    return NextResponse.json(
      { scenarios: payload.scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Scenarios fetch failed:", error);
    return NextResponse.json(
      { scenarios: fallbackScenarios().scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
