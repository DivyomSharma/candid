import { NextResponse } from "next/server";
import { generateCandorScenarios } from "@/lib/candor/scenarios";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { scenarios: (await generateCandorScenarios(createEmptyMemory())).scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user } = await supabaseAdmin
      .from("candor_users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { scenarios: (await generateCandorScenarios(createEmptyMemory())).scenarios },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    const payload = await generateCandorScenarios(memory);
    return NextResponse.json(
      { scenarios: payload.scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Scenarios fetch failed:", error);
    return NextResponse.json(
      { scenarios: (await generateCandorScenarios(createEmptyMemory())).scenarios },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
