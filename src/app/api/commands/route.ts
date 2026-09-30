import { NextRequest, NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const command = searchParams.get("command");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const where: any = {};
      if (serverId) where.serverId = serverId;
      if (command) where.commandName = command;
      if (severity) where.severity = severity;
      if (status) where.status = status;

      const executions = await prisma.commandExecution.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          server: true,
          aiEnrichment: true,
          actions: true,
          interactionRecord: true,
          notificationDeliveries: true,
        },
      });

      return NextResponse.json({ executions });
    } catch (err) {
      // Fall through to memory store fallback
    }
  }

  // Memory Fallback
  let items = [...inMemoryStore.commandExecutions];
  if (serverId) items = items.filter((i) => i.serverId === serverId);
  if (command) items = items.filter((i) => i.commandName === command);
  if (severity) items = items.filter((i) => i.severity === severity);
  if (status) items = items.filter((i) => i.status === status);

  return NextResponse.json({ executions: items });
}
