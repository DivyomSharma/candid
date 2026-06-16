import { NextResponse } from "next/server";
import { generateCandidEntry } from "@/lib/candid/entry";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { entry: await generateCandidEntry(createEmptyMemory()) },
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
        { entry: await generateCandidEntry(createEmptyMemory()) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    return NextResponse.json(
      { entry: await generateCandidEntry(memory) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Entry fetch failed:", error);
    return NextResponse.json(
      { entry: await generateCandidEntry(createEmptyMemory()) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
