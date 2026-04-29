import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { CandorHistoryMessage } from "@/lib/candor-api";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { prisma } from "@/lib/prisma";

async function getUserConversation(clerkId: string, conversationId: string) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  });

  return prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
    include: {
      user: { include: { traits: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

function isLocalConversation(id: string) {
  return id.startsWith("local-");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isLocalConversation(id)) {
    return NextResponse.json({ messages: [], persisted: false });
  }

  const conversation = await getUserConversation(userId, id);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role === "user" ? "user" : "ai",
      content: message.content,
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    message?: string;
    history?: CandorHistoryMessage[];
  };
  const content = body.message?.trim();

  if (!content) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  if (isLocalConversation(id)) {
    const history = body.history ?? [];
    let aiContent = "yeah... i'm here.\nkeep going.";

    try {
      const turn = await runCandorTurn({
        userId,
        message: content,
        history,
        memory: createEmptyMemory(),
      });
      aiContent = turn.reply;
    } catch (error) {
      console.error("Local Candor turn failed:", error);
    }

    return NextResponse.json({
      persisted: false,
      message: {
        id: crypto.randomUUID(),
        role: "ai",
        content: aiContent,
      },
    });
  }

  const conversation = await getUserConversation(userId, id);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content,
    },
  });

  const history =
    body.history ??
    conversation.messages.map((message) => ({
      role: message.role === "user" ? "user" : "ai",
      content: message.content,
    }));

  let aiContent: string;
  let memory = normalizeMemory(conversation.user.traits?.json ?? createEmptyMemory());

  try {
    const turn = await runCandorTurn({
      userId,
      message: content,
      history,
      memory,
    });
    aiContent = turn.reply;
    memory = turn.memory;
  } catch {
    aiContent = "yeah... i lost the thread for a second.\ntry saying that again, simpler.";
  }

  const aiMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "ai",
      content: aiContent,
    },
  });

  await prisma.traits.upsert({
    where: { userId: conversation.userId },
    update: { json: memory },
    create: { userId: conversation.userId, json: memory },
  });

  return NextResponse.json({
    message: {
      id: aiMessage.id,
      role: "ai",
      content: aiMessage.content,
    },
  });
}
