import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getCandidAccess } from "@/lib/candid/access";
import { getOrCreateCandidUser } from "@/lib/candid/persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await getOrCreateCandidUser(authId);
    const access = await getCandidAccess(user.id);
    return NextResponse.json({ access }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "access_unavailable" }, { status: 500 });
  }
}
