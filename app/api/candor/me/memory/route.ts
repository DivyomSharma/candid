import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getOrCreateCandorUser } from "@/lib/candor/persistence";
import {
  clearEverythingCandorKnows,
  clearRelationalMemory,
  deleteMemoryEvent,
  deleteMemoryFact,
  getMemoryControlSnapshot,
  setInitiativesPaused,
} from "@/lib/candor/memory-controls";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getOrCreateCandorUser(authId);
  const snapshot = await getMemoryControlSnapshot(user.id);
  return NextResponse.json(snapshot);
}

export async function PATCH(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: "delete_event" | "delete_fact" | "clear_relational" | "clear_all" | "pause_initiatives";
    id?: string;
    paused?: boolean;
  };
  const user = await getOrCreateCandorUser(authId);

  if (body.action === "delete_event" && body.id) {
    await deleteMemoryEvent(user.id, body.id);
  } else if (body.action === "delete_fact" && body.id) {
    await deleteMemoryFact(user.id, body.id);
  } else if (body.action === "clear_relational") {
    await clearRelationalMemory(user.id);
  } else if (body.action === "clear_all") {
    await clearEverythingCandorKnows(user.id);
  } else if (body.action === "pause_initiatives") {
    await setInitiativesPaused(user.id, Boolean(body.paused));
  } else {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const snapshot = await getMemoryControlSnapshot(user.id);
  return NextResponse.json(snapshot);
}
