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
          _count: {
            select: { commandExecutions: true, commandRules: true },
          },
        },
      });
      return NextResponse.json({ servers });
    } catch (err) {
      // Fall through to memory store
    }
  }

  return NextResponse.json({ servers: inMemoryStore.discordServers });
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
          action: "SERVER_CONNECTED",
          resource: "DiscordServer",
          resourceId: server.id,
          metadata: { discordGuildId, name },
        },
      });

      return NextResponse.json({ server }, { status: 201 });
    } catch (err) {
      // Fall through to memory fallback
    }
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
