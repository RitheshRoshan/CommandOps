import { NextResponse } from "next/server";
import { isDbConnected } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/factory";

export async function GET() {
  const dbConnected = await isDbConnected();
  const aiProvider = getAIProvider();

  return NextResponse.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    checks: {
      database: dbConnected ? "healthy" : "degraded_demo_fallback",
      discordGateway: process.env.DISCORD_PUBLIC_KEY ? "configured" : "unconfigured",
      aiProvider: aiProvider.isAvailable() ? `available (${aiProvider.name})` : "unavailable",
      notificationMirror: process.env.DEFAULT_MIRROR_WEBHOOK_URL ? "configured" : "unconfigured",
    },
  });
}
