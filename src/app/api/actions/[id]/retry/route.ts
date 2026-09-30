import { NextRequest, NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { NotificationMirrorService } from "@/lib/notifications/webhook-mirror";
import { logger } from "@/lib/logger";
import { sseManager } from "@/lib/sse-manager";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbConnected = await isDbConnected();

  if (dbConnected) {
    try {
      const delivery = await prisma.notificationDelivery.findUnique({
        where: { id },
        include: { commandExecution: true },
      });

      if (!delivery) {
        return NextResponse.json({ error: "Action or delivery not found" }, { status: 404 });
      }

      const webhookUrl = process.env.DEFAULT_MIRROR_WEBHOOK_URL || delivery.destination;

      // Execute Retry
      const result = await NotificationMirrorService.deliverWithRetry({
        webhookUrl,
        commandExecutionId: delivery.commandExecutionId,
        correlationId: delivery.commandExecution.correlationId,
        commandName: delivery.commandExecution.commandName,
        title: delivery.commandExecution.title || undefined,
        description: delivery.commandExecution.description || undefined,
        severity: delivery.commandExecution.severity || "MEDIUM",
        category: delivery.commandExecution.category || "OTHER",
        username: delivery.commandExecution.username,
        maxAttempts: 1, // Single manual attempt
      });

      const newStatus = result.success ? "SUCCESS" : "FAILED";
      const updated = await prisma.notificationDelivery.update({
        where: { id },
        data: {
          status: newStatus,
          attempts: { increment: 1 },
          lastError: result.lastError || null,
          sentAt: result.success ? new Date() : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.sub,
          serverId: delivery.commandExecution?.serverId || null,
          action: "MANUAL_RETRY_EXECUTED",
          resource: "NotificationDelivery",
          resourceId: id,
          metadata: { success: result.success, attempts: updated.attempts, serverId: delivery.commandExecution?.serverId },
        },
      });

      // Broadcast SSE update to live stream
      try {
        sseManager.broadcast("failure_retried", {
          id,
          status: newStatus,
          attempts: updated.attempts,
        });
      } catch (e) {
        // SSE broadcast warning
      }

      logger.info({
        event: "action.manual_retry",
        actionId: id,
        success: result.success,
        adminId: admin.sub,
      });

      return NextResponse.json({ success: true, delivery: updated });
    } catch (err) {
      if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
      }
    }
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
  }

  // Memory Fallback for DEMO_MODE only
  const execution = inMemoryStore.commandExecutions.find((e) => `delivery-${e.id}` === id || e.id === id);
  if (execution) {
    execution.mirrorStatus = "SUCCESS";
    inMemoryStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      adminId: admin.sub,
      action: "MANUAL_RETRY_EXECUTED",
      resource: "NotificationDelivery",
      resourceId: id,
      metadata: { success: true },
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ success: true, message: "Manual retry executed successfully" });
}
