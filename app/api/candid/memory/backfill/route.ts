import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { embedCandidText } from "@/lib/candid/embeddings";
import { getOrCreateCandidUser } from "@/lib/candid/persistence";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getOrCreateCandidUser(authId);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: events, error } = await supabaseAdmin
    .from("candid_memory_events")
    .select("id, content")
    .eq("user_id", user.id)
    .limit(40);

  if (error || !events) return NextResponse.json({ embedded: 0 });

  let embedded = 0;
  for (const event of events) {
    const { data: existing } = await supabaseAdmin
      .from("candid_memory_embeddings")
      .select("id")
      .eq("memory_event_id", event.id)
      .maybeSingle();
    if (existing) continue;

    const result = await embedCandidText(event.content as string);
    if (!result) continue;

    await supabaseAdmin.from("candid_memory_embeddings").insert({
      user_id: user.id,
      memory_event_id: event.id,
      embedding_provider: result.provider,
      embedding_model: result.model,
      content: event.content,
      embedding: result.embedding,
    });
    embedded += 1;
  }

  return NextResponse.json({ embedded });
}
