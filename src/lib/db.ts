// @ts-ignore
import { PrismaClient } from "@prisma/client";

// Global singleton pattern for PrismaClient in Next.js development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// In-Memory Storage Fallback (Initial state empty for real operational tracking)
export interface MemoryStore {
  adminUsers: Array<any>;
  discordServers: Array<any>;
  interactionRecords: Array<any>;
  commandExecutions: Array<any>;
  commandRules: Array<any>;
  commandActions: Array<any>;
  aiEnrichments: Array<any>;
  notificationDeliveries: Array<any>;
  auditLogs: Array<any>;
}

export const inMemoryStore: MemoryStore = {
  adminUsers: [],
  discordServers: [],
  interactionRecords: [],
  commandExecutions: [],
  commandRules: [],
  commandActions: [],
  aiEnrichments: [],
  notificationDeliveries: [],
  auditLogs: [],
};

export async function isDbConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Automatic reconnect attempt for serverless DBs (Neon/Supabase) after idle sleep
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
