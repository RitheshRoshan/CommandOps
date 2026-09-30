import { NextResponse } from "next/server";
import { isDbConnected } from "@/lib/db";

export async function GET() {
  const dbConnected = await isDbConnected();

  if (!dbConnected && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ ready: false, reason: "Database unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
}
