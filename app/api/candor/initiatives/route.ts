import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { fetchDueInitiative } from "@/lib/candor/initiatives";
import { getOrCreateCandorUser, persistMessage } from "@/lib/candor/persistence";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getOrCreateCandorUser(authId);
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
