import { NextRequest, NextResponse } from "next/server";
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
      const servers = await prisma.discordServer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          channels: true,
          _count: {
            select: {
              commandExecutions: true,
              commandRules: true,
              memberships: true,
              channels: true,
            },
          },
          commandExecutions: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          },
        },
      });

      const formatted = servers.map((s: any) => ({
        id: s.id,
        discordGuildId: s.discordGuildId,
        name: s.name,
        iconUrl: s.iconUrl,
        mirrorWebhookUrl: s.mirrorWebhookUrl,
        isActive: s.isActive,
        status: s.isActive ? "ONLINE" : "OFFLINE",
        memberCount: s._count.memberships || 0,
        channelCount: s._count.channels || s.channels.length || 0,
        commandCount: s._count.commandRules || 0,
        executionCount: s._count.commandExecutions || 0,
        lastActivity: s.commandExecutions[0] ? s.commandExecutions[0].createdAt.toISOString() : s.createdAt.toISOString(),
        channels: s.channels.map((c: any) => ({
          id: c.id,
          discordChannelId: c.discordChannelId,
          name: c.name,
          type: c.type || "GUILD_TEXT",
        })),
      }));

      return NextResponse.json({ servers: formatted });
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
  const formatted = inMemoryStore.discordServers.map((s) => ({
    id: s.id,
    discordGuildId: s.discordGuildId,
    name: s.name,
    iconUrl: s.iconUrl,
    mirrorWebhookUrl: s.mirrorWebhookUrl,
    isActive: s.isActive !== false,
    status: s.isActive !== false ? "ONLINE" : "OFFLINE",
    memberCount: 0,
    channelCount: 0,
    commandCount: 0,
    executionCount: inMemoryStore.commandExecutions.filter((e) => e.serverId === s.id).length,
    lastActivity: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    channels: [],
  }));

  return NextResponse.json({ servers: formatted });
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discordGuildId, name, mirrorWebhookUrl } = await req.json();

  if (!discordGuildId || !name) {
    return NextResponse.json({ error: "Guild ID and Server Name required" }, { status: 400 });
  }

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const server = await prisma.discordServer.create({
        data: {
          discordGuildId,
          name,
          mirrorWebhookUrl: mirrorWebhookUrl || null,
          isActive: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.sub,
          serverId: server.id,
          action: "SERVER_CONNECTED",
          resource: "DiscordServer",
          resourceId: server.id,
          metadata: { discordGuildId, name },
        },
      });

      return NextResponse.json({ server }, { status: 201 });
    } catch (err) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
      }
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  const server = {
    id: `server-${Date.now()}`,
    discordGuildId,
    name,
    mirrorWebhookUrl,
    isActive: true,
    createdAt: new Date(),
  };

  inMemoryStore.discordServers.push(server);
  return NextResponse.json({ server }, { status: 201 });
}
