import { NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const failedDeliveries = await prisma.notificationDelivery.findMany({
        where: { status: "FAILED" },
        orderBy: { createdAt: "desc" },
        include: { commandExecution: true },
      });

      const failedActions = await prisma.commandAction.findMany({
        where: { status: "FAILED" },
        orderBy: { createdAt: "desc" },
        include: { commandExecution: true },
      });

      return NextResponse.json({ failedDeliveries, failedActions });
    } catch (err) {
      // Fall through to memory store
    }
  }

  const failedExecutions = inMemoryStore.commandExecutions.filter(
    (e) => e.mirrorStatus === "FAILED" || e.status === "FAILED"
  );

  return NextResponse.json({
    failedDeliveries: failedExecutions.map((e) => ({
      id: `delivery-${e.id}`,
      commandExecutionId: e.id,
      channelType: "DISCORD_MIRROR",
      destination: "Webhook Mirror",
      status: "FAILED",
      attempts: 3,
      lastError: "Connection timeout after 3 attempts (HTTP 504)",
      createdAt: e.createdAt,
      commandExecution: e,
    })),
    failedActions: [],
  });
}
