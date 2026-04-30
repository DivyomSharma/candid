import { NextResponse } from "next/server";
import { getAlignmentPreview } from "@/lib/candor/alignment";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
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
      });
    }

    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());

    return NextResponse.json({
      memory,
      alignment: getAlignmentPreview(memory),
    });
  } catch (error) {
    console.error("Traits fetch failed:", error);
    const memory = createEmptyMemory();
    return NextResponse.json({
      memory,
      alignment: getAlignmentPreview(memory),
    });
  }
}
