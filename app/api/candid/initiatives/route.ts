import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { fetchDueInitiative } from "@/lib/candid/initiatives";
import { getOrCreateCandidUser, persistMessage } from "@/lib/candid/persistence";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getOrCreateCandidUser(authId);
  const content = await fetchDueInitiative(user.id);
  if (!content) return NextResponse.json({ message: null });

  const persisted = await persistMessage({
    userId: user.id,
    role: "ai",
    content,
  });

  return NextResponse.json({
    message: {
      id: persisted?.id ?? crypto.randomUUID(),
      role: "ai",
      content,
    },
  });
}
