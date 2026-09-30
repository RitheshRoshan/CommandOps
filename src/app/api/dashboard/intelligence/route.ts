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
          id: true,
          commandName: true,
          status: true,
          executionTimeMs: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return computeIntelligence(executions);
    } catch (err) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
      }
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  return computeIntelligence(inMemoryStore.commandExecutions);
}

function computeIntelligence(executions: Array<any>) {
  const total = executions.length;
  if (total === 0) {
    return NextResponse.json({
      metrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        failureRate: 0,
        avgLatencyMs: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
      },
      commandUsage: [],
      trends: [],
      insights: [
        {
          id: "ins-insufficient",
          type: "INFO",
          title: "Insufficient Operational Data",
          description: "Not enough data to generate an insight.",
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  const successful = executions.filter((e) => e.status === "COMPLETED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;
  const successRate = Number(((successful / total) * 100).toFixed(2));
  const failureRate = Number(((failed / total) * 100).toFixed(2));

  // Latencies
  const durations = executions
    .map((e) => e.executionTimeMs || 0)
    .sort((a, b) => a - b);

  const avgLatencyMs = Math.round(durations.reduce((a, b) => a + b, 0) / total);
  const p50LatencyMs = getPercentile(durations, 50);
  const p95LatencyMs = getPercentile(durations, 95);
  const p99LatencyMs = getPercentile(durations, 99);

  // Command usage breakdown
  const usageMap = new Map<string, number>();
  for (const e of executions) {
    const name = e.commandName.startsWith("/") ? e.commandName : `/${e.commandName}`;
    usageMap.set(name, (usageMap.get(name) || 0) + 1);
  }

  const commandUsage = Array.from(usageMap.entries()).map(([command, count]) => ({
    command,
    count,
    percentage: Number(((count / total) * 100).toFixed(1)),
  }));

  // Trends over time (grouped by date)
  const dateMap = new Map<string, { date: string; count: number; failures: number }>();
  for (const e of executions) {
    const d = new Date(e.createdAt).toISOString().split("T")[0];
    let entry = dateMap.get(d);
    if (!entry) {
      entry = { date: d, count: 0, failures: 0 };
      dateMap.set(d, entry);
    }
    entry.count++;
    if (e.status === "FAILED") entry.failures++;
  }

  const trends = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Generated insights from real operational data
  const insights: Array<any> = [];

  if (failureRate > 10) {
    insights.push({
      id: "ins-high-failures",
      type: "WARNING",
      title: "High Failure Rate Detected",
      description: `Failure rate is currently ${failureRate}%, exceeding the 5% threshold. Check Failure Center.`,
      timestamp: new Date().toISOString(),
    });
  }

  if (p95LatencyMs > 1000) {
    insights.push({
      id: "ins-high-latency",
      type: "ALERT",
      title: "Elevated P95 Latency",
      description: `P95 response latency reached ${p95LatencyMs}ms. Review downstream webhook timeouts.`,
      timestamp: new Date().toISOString(),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "ins-healthy",
      type: "SUCCESS",
      title: "System Latency & Success Rates Healthy",
      description: `Overall success rate is ${successRate}% with an average latency of ${avgLatencyMs}ms across ${total} executions.`,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    metrics: {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate,
      failureRate,
      avgLatencyMs,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs,
    },
    commandUsage,
    trends,
    insights,
  });
}

function getPercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}
