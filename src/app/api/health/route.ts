import { NextResponse } from "next/server";
import { isDbConnected } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/factory";

export async function GET() {
  const dbConnected = await isDbConnected();
  const aiProvider = getAIProvider();

  const isHealthy = dbConnected;

  return NextResponse.json({
    status: isHealthy ? "operational" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
    checks: {
      database: dbConnected ? "Healthy" : "Unavailable",
      application: "Healthy",
      discordGateway: process.env.DISCORD_PUBLIC_KEY ? "Configured" : "Not configured",
      aiProvider: aiProvider.isAvailable() ? `Configured (${aiProvider.name})` : "Not configured",
      notificationMirror: process.env.DEFAULT_MIRROR_WEBHOOK_URL ? "Configured" : "Not configured",
    },
  });
}
