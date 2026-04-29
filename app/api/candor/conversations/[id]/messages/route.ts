import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendCandorMessage, type CandorHistoryMessage } from "@/lib/candor-api";
import { shapeCandorResponse } from "@/lib/candor-response";
import { prisma } from "@/lib/prisma";

async function getUserConversation(clerkId: string, conversationId: string) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  });

  return prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  try {
    aiContent = shapeCandorResponse(
      await sendCandorMessage({
        message: content,
        history,
        user_id: userId,
      }),
    );
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

  return NextResponse.json({
    message: {
      id: aiMessage.id,
      role: "ai",
      content: aiMessage.content,
    },
  });
}
