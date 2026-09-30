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

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const where: any = {};
      if (serverId) where.serverId = serverId;

      const rules = await prisma.commandRule.findMany({
        where,
        orderBy: { priority: "desc" },
        include: { server: true },
      });
      return NextResponse.json({ rules });
    } catch (err) {
      // Fall through to memory store
    }
  }

  let items = [...inMemoryStore.commandRules];
  if (serverId) items = items.filter((r) => r.serverId === serverId || r.serverId === "*");
  return NextResponse.json({ rules: items });
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { serverId, name, description, commandName, conditions, actions, priority } = body;

  if (!serverId || !name || !commandName || !actions) {
    return NextResponse.json({ error: "Missing required rule parameters" }, { status: 400 });
  }

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const rule = await prisma.commandRule.create({
        data: {
          serverId,
          name,
          description,
          commandName,
          conditions: conditions || [],
          actions: actions || ["PERSIST", "RESPOND_DISCORD"],
          priority: Number(priority) || 100,
          isEnabled: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.sub,
          action: "RULE_CREATED",
          resource: "CommandRule",
          resourceId: rule.id,
          metadata: { name, commandName, serverId },
        },
      });

      return NextResponse.json({ rule }, { status: 201 });
    } catch (err) {
      // Fall through to memory fallback
    }
  }

  const rule = {
    id: `rule-${Date.now()}`,
    serverId,
    name,
    description,
    commandName,
    conditions: conditions || [],
    actions: actions || ["PERSIST", "RESPOND_DISCORD"],
    priority: Number(priority) || 100,
    isEnabled: true,
    createdAt: new Date(),
  };

  inMemoryStore.commandRules.push(rule);
  inMemoryStore.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminId: admin.sub,
    action: "RULE_CREATED",
    resource: "CommandRule",
    resourceId: rule.id,
    metadata: { name, commandName, serverId },
    createdAt: new Date(),
  });

  return NextResponse.json({ rule }, { status: 201 });
}
