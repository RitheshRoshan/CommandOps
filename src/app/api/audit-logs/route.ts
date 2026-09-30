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
      const auditLogs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { admin: true },
      });
      return NextResponse.json({ auditLogs });
    } catch (err) {
      // Fall through to memory store
    }
  }

  return NextResponse.json({ auditLogs: inMemoryStore.auditLogs });
}
