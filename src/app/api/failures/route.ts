import { NextRequest, NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const [totalDeliveries, failedDeliveries, failedActions] = await Promise.all([
        prisma.notificationDelivery.count({ where: { status: "FAILED" } }),
        prisma.notificationDelivery.findMany({
          where: { status: "FAILED" },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            commandExecution: {
              include: { server: true },
            },
          },
        }),
        prisma.commandAction.findMany({
          where: { status: "FAILED" },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            commandExecution: {
              include: { server: true },
            },
          },
        }),
      ]);

      const formattedDeliveries = failedDeliveries.map((d: any) => ({
        id: d.id,
        commandExecutionId: d.commandExecutionId,
        channelType: d.channelType,
        destination: d.destination,
        status: d.status,
        attempts: d.attempts,
        maxAttempts: d.maxAttempts,
        lastError: d.lastError || "Unknown delivery failure",
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        command: d.commandExecution?.commandName || "—",
        server: d.commandExecution?.server?.name || "Unknown server",
        channel: d.commandExecution?.channelId ? `#${d.commandExecution.channelId}` : "Unknown channel",
        user: d.commandExecution?.username ? `@${d.commandExecution.username}` : "—",
        commandExecution: d.commandExecution,
      }));

      const totalPages = Math.ceil(totalDeliveries / limit);

      return NextResponse.json({
        items: formattedDeliveries,
        failedDeliveries: formattedDeliveries,
        failedActions,
        pagination: {
          page,
          limit,
          total: totalDeliveries,
          totalPages,
        },
      });
    } catch (err) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
      }
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  // Memory store fallback for DEMO_MODE only
  const items = inMemoryStore.notificationDeliveries.filter((d) => d.status === "FAILED");
  const total = items.length;
  const paginated = items.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    items: paginated,
    failedDeliveries: paginated,
    failedActions: [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
