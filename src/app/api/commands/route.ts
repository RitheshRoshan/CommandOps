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

      const [total, items] = await Promise.all([
        prisma.commandExecution.count({ where }),
        prisma.commandExecution.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            server: true,
            aiEnrichment: true,
            actions: true,
            interactionRecord: true,
            notificationDeliveries: true,
          },
        }),
      ]);

      const formatted = items.map((e: any) => ({
        id: e.id,
        correlationId: e.correlationId,
        interactionId: e.interactionId,
        command: e.commandName.startsWith("/") ? e.commandName : `/${e.commandName}`,
        commandName: e.commandName,
        user: `@${e.username}`,
        username: e.username,
        userId: e.userId,
        server: e.server?.name || "Unknown server",
        serverId: e.serverId,
        channel: e.channelId ? `#${e.channelId}` : "Unknown channel",
        channelId: e.channelId,
        title: e.title || "—",
        description: e.description || "—",
        severity: e.severity || "LOW",
        category: e.category || "OTHER",
        status: e.status,
        durationMs: e.executionTimeMs !== null ? e.executionTimeMs : "—",
        executionTimeMs: e.executionTimeMs,
        matchedRuleId: e.matchedRuleId || "—",
        createdAt: e.createdAt.toISOString(),
        aiEnrichment: e.aiEnrichment,
        actions: e.actions,
        notificationDeliveries: e.notificationDeliveries,
      }));

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        items: formatted,
        executions: formatted, // Backward compatibility
        pagination: {
          page,
          limit,
          total,
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

  // Memory fallback for DEMO_MODE only
  let filtered = [...inMemoryStore.commandExecutions];
  if (serverId) filtered = filtered.filter((i) => i.serverId === serverId);
  if (command) filtered = filtered.filter((i) => i.commandName === command);
  if (severity) filtered = filtered.filter((i) => i.severity === severity);
  if (status) filtered = filtered.filter((i) => i.status === status);

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  const formatted = paginated.map((e) => ({
    id: e.id,
    correlationId: e.correlationId,
    interactionId: e.interactionId,
    command: e.commandName?.startsWith("/") ? e.commandName : `/${e.commandName || "command"}`,
    commandName: e.commandName,
    user: `@${e.username || "user"}`,
    username: e.username,
    userId: e.userId,
    server: e.server?.name || "Unknown server",
    serverId: e.serverId,
    channel: e.channelId ? `#${e.channelId}` : "Unknown channel",
    channelId: e.channelId,
    title: e.title || "—",
    description: e.description || "—",
    severity: e.severity || "LOW",
    category: e.category || "OTHER",
    status: e.status || "COMPLETED",
    durationMs: e.executionTimeMs !== undefined ? e.executionTimeMs : "—",
    executionTimeMs: e.executionTimeMs,
    matchedRuleId: e.matchedRuleId || "—",
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    aiEnrichment: null,
    actions: [],
    notificationDeliveries: [],
  }));

  return NextResponse.json({
    items: formatted,
    executions: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
