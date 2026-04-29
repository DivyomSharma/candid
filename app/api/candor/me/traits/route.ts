import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAlignmentPreview } from "@/lib/candor/alignment";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    const memory = createEmptyMemory();
    return NextResponse.json({
      memory,
      alignment: getAlignmentPreview(memory),
    });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { traits: true },
  });

  const memory = normalizeMemory(user?.traits?.json ?? createEmptyMemory());

  return NextResponse.json({
    memory,
    alignment: getAlignmentPreview(memory),
  });
}
