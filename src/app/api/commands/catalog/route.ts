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
      const executions = await prisma.commandExecution.findMany({
        select: {
          commandName: true,
          status: true,
          executionTimeMs: true,
          createdAt: true,
          serverId: true,
        },
      });

      const catalogMap = new Map<string, {
        command: string;
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        totalDuration: number;
        lastExecution: Date | null;
        servers: Set<string>;
      }>();

      for (const exec of executions) {
        const name = exec.commandName.startsWith("/") ? exec.commandName : `/${exec.commandName}`;
        let entry = catalogMap.get(name);
        if (!entry) {
          entry = {
            command: name,
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            totalDuration: 0,
            lastExecution: null,
            servers: new Set<string>(),
          };
          catalogMap.set(name, entry);
        }

        entry.totalExecutions++;
        if (exec.status === "COMPLETED") entry.successfulExecutions++;
        if (exec.status === "FAILED") entry.failedExecutions++;
        entry.totalDuration += exec.executionTimeMs || 0;
        entry.servers.add(exec.serverId);

        if (!entry.lastExecution || exec.createdAt > entry.lastExecution) {
          entry.lastExecution = exec.createdAt;
        }
      }

      const catalog = Array.from(catalogMap.values()).map((c) => ({
        command: c.command,
        totalExecutions: c.totalExecutions,
        successfulExecutions: c.successfulExecutions,
        failedExecutions: c.failedExecutions,
        successRate: c.totalExecutions > 0 ? Number(((c.successfulExecutions / c.totalExecutions) * 100).toFixed(2)) : 0,
        averageResponseTime: c.totalExecutions > 0 ? Math.round(c.totalDuration / c.totalExecutions) : 0,
        lastExecution: c.lastExecution ? c.lastExecution.toISOString() : null,
        serverCount: c.servers.size,
      }));

      return NextResponse.json({ commands: catalog });
    } catch (err) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
      }
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  // Memory calculation fallback (for DEMO_MODE only)
  const items = inMemoryStore.commandExecutions;
  const catalogMap = new Map<string, any>();

  for (const exec of items) {
    const name = exec.commandName.startsWith("/") ? exec.commandName : `/${exec.commandName}`;
    let entry = catalogMap.get(name);
    if (!entry) {
      entry = {
        command: name,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalDuration: 0,
        lastExecution: null,
        servers: new Set<string>(),
      };
      catalogMap.set(name, entry);
    }

    entry.totalExecutions++;
    if (exec.status === "COMPLETED") entry.successfulExecutions++;
    if (exec.status === "FAILED") entry.failedExecutions++;
    entry.totalDuration += exec.executionTimeMs || 0;
    if (exec.serverId) entry.servers.add(exec.serverId);

    const createdAtDate = new Date(exec.createdAt);
    if (!entry.lastExecution || createdAtDate > entry.lastExecution) {
      entry.lastExecution = createdAtDate;
    }
  }

  const catalog = Array.from(catalogMap.values()).map((c) => ({
    command: c.command,
    totalExecutions: c.totalExecutions,
    successfulExecutions: c.successfulExecutions,
    failedExecutions: c.failedExecutions,
    successRate: c.totalExecutions > 0 ? Number(((c.successfulExecutions / c.totalExecutions) * 100).toFixed(2)) : 0,
    averageResponseTime: c.totalExecutions > 0 ? Math.round(c.totalDuration / c.totalExecutions) : 0,
    lastExecution: c.lastExecution ? c.lastExecution.toISOString() : null,
    serverCount: c.servers.size,
  }));

  return NextResponse.json({ commands: catalog });
}
