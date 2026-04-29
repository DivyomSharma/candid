import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendCandorMessage } from "@/lib/candor-api";
import { shapeCandorResponse } from "@/lib/candor-response";
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

      let aiContent: string;

      try {
        aiContent = shapeCandorResponse(
          await sendCandorMessage({
            message: opening,
            history: [],
            user_id: userId,
          }),
        );
      } catch (error) {
        console.error("Candor AI fallback used:", error);
        aiContent = "hmm... that already says something.\nlet it stay here for a second.";
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "ai",
          content: aiContent,
        },
      });
    }

    return NextResponse.json({ id: conversation.id });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return NextResponse.json({ error: "conversation_create_failed" }, { status: 500 });
  }
}
