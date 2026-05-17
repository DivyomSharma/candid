import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getCandorAccess } from "@/lib/candor/access";
import { getOrCreateCandorUser } from "@/lib/candor/persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await getOrCreateCandorUser(authId);
    const access = await getCandorAccess(user.id);
    return NextResponse.json({ access }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "access_unavailable" }, { status: 500 });
  }
}
