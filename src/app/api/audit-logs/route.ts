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
  const action = searchParams.get("action");
  const resource = searchParams.get("resource");

  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const where: any = {};
      if (serverId) where.serverId = serverId;
      if (action) where.action = action;
      if (resource) where.resource = resource;

      const [total, items] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
            server: {
              select: { id: true, name: true, discordGuildId: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const formatted = items.map((log: any) => ({
        id: log.id,
        actor: log.admin?.name || log.admin?.email || log.adminId || "—",
        server: log.server?.name || "—",
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || "—",
        result: "SUCCESS",
        ipAddress: log.ipAddress || "—",
        metadata: log.metadata || {},
        createdAt: log.createdAt.toISOString(),
      }));

      return NextResponse.json({
        items: formatted,
        auditLogs: formatted, // Backward compatibility
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
  let filtered = [...inMemoryStore.auditLogs];
  if (serverId) filtered = filtered.filter((l) => l.serverId === serverId);
  if (action) filtered = filtered.filter((l) => l.action === action);
  if (resource) filtered = filtered.filter((l) => l.resource === resource);

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  const formatted = paginated.map((log) => ({
    id: log.id,
    actor: log.adminId ? "Admin User" : "—",
    server: "—",
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId || "—",
    result: "SUCCESS",
    ipAddress: log.ipAddress || "—",
    metadata: log.metadata || {},
    createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
  }));

  return NextResponse.json({
    items: formatted,
    auditLogs: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
