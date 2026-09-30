import { NextRequest, NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbConnected = await isDbConnected();

  if (dbConnected) {
    const execution = await prisma.commandExecution.findFirst({
      where: {
        OR: [{ id: id }, { correlationId: id }, { interactionId: id }],
      },
      include: {
        server: true,
        aiEnrichment: true,
        actions: true,
        interactionRecord: true,
        notificationDeliveries: true,
      },
    });

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    return NextResponse.json({ execution });
  }

  // Memory Fallback
  const execution = inMemoryStore.commandExecutions.find(
    (e) => e.id === id || e.correlationId === id || e.interactionId === id
  );

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  return NextResponse.json({ execution });
}
