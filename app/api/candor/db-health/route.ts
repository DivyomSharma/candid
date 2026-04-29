import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "missing_database_url" }, { status: 503 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();

    return NextResponse.json({ ok: true, userCount });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 500 });
  }
}
