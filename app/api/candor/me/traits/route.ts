import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAlignmentPreview } from "@/lib/candor/alignment";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      const memory = createEmptyMemory();
      return NextResponse.json({
        memory,
        alignment: getAlignmentPreview(memory),
      });
    }

    const { data: traits } = await supabaseAdmin
      .from("traits")
      .select("data")
      .eq("user_id", user.id)
      .single();

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
