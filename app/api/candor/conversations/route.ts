import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "missing_database_url" }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as { message?: string };
    const opening = body.message?.trim();

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });
    const traits = await prisma.traits.findUnique({
      where: { userId: user.id },
    });

    const conversation = await prisma.conversation.create({
      data: { userId: user.id },
    });

    if (opening) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: opening,
        },
      });

      let aiContent = "hmm... that already says something.\nlet it stay here for a second.";
      let memory = normalizeMemory(traits?.json ?? createEmptyMemory());

      try {
        const turn = await runCandorTurn({
          userId,
          message: opening,
          history: [],
          memory,
        });
        aiContent = turn.reply;
        memory = turn.memory;
      } catch (error) {
        console.error("Candor AI fallback used:", error);
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "ai",
          content: aiContent,
        },
      });

      await prisma.traits.upsert({
        where: { userId: user.id },
        update: { json: memory },
        create: { userId: user.id, json: memory },
      });
    }

    return NextResponse.json({ id: conversation.id, persisted: true });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return NextResponse.json({
      id: `local-${crypto.randomUUID()}`,
      persisted: false,
      warning: "database_unavailable",
    });
  }
}
