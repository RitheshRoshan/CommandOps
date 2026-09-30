import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CommandOps Database...");

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash("admin_password_123!", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@commandops.io" },
    update: { passwordHash },
    create: {
      email: "admin@commandops.io",
      name: "CommandOps Principal Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin Created: ${admin.email}`);

  // 2. Create Default Production Guild Server
  const server = await prisma.discordServer.upsert({
    where: { discordGuildId: "guild-prod-001" },
    update: {},
    create: {
      discordGuildId: "guild-prod-001",
      name: "Production Cluster Guild",
      mirrorWebhookUrl: "https://discord.com/api/webhooks/123456789/mock-webhook",
      isActive: true,
    },
  });
  console.log(`✅ Server Created: ${server.name} (${server.id})`);

  // 3. Create Default Command Rules
  await prisma.commandRule.deleteMany({ where: { serverId: server.id } });

  const criticalRule = await prisma.commandRule.create({
    data: {
      serverId: server.id,
      name: "Critical Incident Escalation Pipeline",
      description: "Escalates CRITICAL or HIGH severity reports to mirror webhook and invokes AI enrichment.",
      commandName: "report",
      priority: 200,
      isEnabled: true,
      conditions: [
        {
          field: "severity",
          operator: "IN",
          value: ["HIGH", "CRITICAL"],
        },
      ],
      actions: ["PERSIST", "RESPOND_DISCORD", "MIRROR_NOTIFICATION", "CREATE_ALERT", "AI_ENRICHMENT"],
    },
  });

  const lowRule = await prisma.commandRule.create({
    data: {
      serverId: server.id,
      name: "Standard Low Severity Logging",
      description: "Logs LOW severity reports to dashboard without triggering external mirror webhooks.",
      commandName: "report",
      priority: 100,
      isEnabled: true,
      conditions: [
        {
          field: "severity",
          operator: "IN",
          value: ["LOW", "MEDIUM"],
        },
      ],
      actions: ["PERSIST", "RESPOND_DISCORD", "AI_ENRICHMENT"],
    },
  });

  console.log(`✅ Rules Created: ${criticalRule.name}, ${lowRule.name}`);

  // 4. Seed Initial Operational Command Executions
  const executionsData = [
    {
      correlationId: `cmd_${Date.now() - 3600000}_001`,
      interactionId: `int_${Date.now() - 3600000}_001`,
      serverId: server.id,
      userId: "usr-devops-01",
      username: "alex_ops",
      commandName: "report",
      title: "UPI Checkout Webhook Failure",
      description: "Customers receiving 502 errors when submitting payments via UPI gateway.",
      severity: "CRITICAL" as const,
      category: "PAYMENT" as const,
      status: "COMPLETED" as const,
      executionTimeMs: 142,
    },
    {
      correlationId: `cmd_${Date.now() - 1800000}_002`,
      interactionId: `int_${Date.now() - 1800000}_002`,
      serverId: server.id,
      userId: "usr-sec-02",
      username: "sarah_sec",
      commandName: "status",
      title: "/status check",
      description: "Routine gateway latency and health check.",
      severity: "LOW" as const,
      category: "OTHER" as const,
      status: "COMPLETED" as const,
      executionTimeMs: 48,
    },
    {
      correlationId: `cmd_${Date.now() - 600000}_003`,
      interactionId: `int_${Date.now() - 600000}_003`,
      serverId: server.id,
      userId: "usr-eng-03",
      username: "david_eng",
      commandName: "report",
      title: "High Memory Usage on API Worker #4",
      description: "Pod memory reaching 94% threshold during batch job processing.",
      severity: "HIGH" as const,
      category: "INFRASTRUCTURE" as const,
      status: "COMPLETED" as const,
      executionTimeMs: 189,
    },
  ];

  for (const execData of executionsData) {
    const record = await prisma.interactionRecord.upsert({
      where: { interactionId: execData.interactionId },
      update: {},
      create: {
        interactionId: execData.interactionId,
        correlationId: execData.correlationId,
        interactionType: 2,
        guildId: server.discordGuildId,
        userId: execData.userId,
        username: execData.username,
        rawPayload: { command: execData.commandName },
        signatureVerified: true,
      },
    });

    const execution = await prisma.commandExecution.upsert({
      where: { correlationId: execData.correlationId },
      update: {},
      create: {
        correlationId: execData.correlationId,
        interactionId: record.interactionId,
        serverId: server.id,
        userId: execData.userId,
        username: execData.username,
        commandName: execData.commandName,
        title: execData.title,
        description: execData.description,
        severity: execData.severity,
        category: execData.category,
        status: execData.status,
        executionTimeMs: execData.executionTimeMs,
      },
    });

    if (execData.commandName === "report") {
      await prisma.aIEnrichment.upsert({
        where: { commandExecutionId: execution.id },
        update: {},
        create: {
          commandExecutionId: execution.id,
          provider: "gemini",
          status: "SUCCESS",
          summary: `[AI Triage] ${execData.title} categorized under ${execData.category}. Immediate attention advised.`,
          suggestedCategory: execData.category,
          suggestedSeverity: execData.severity,
          extractedTags: ["incident", execData.category.toLowerCase(), "prod"],
          latencyMs: 110,
        },
      });

      await prisma.notificationDelivery.create({
        data: {
          commandExecutionId: execution.id,
          channelType: "DISCORD_MIRROR",
          destination: server.mirrorWebhookUrl || "mirror-webhook",
          status: "SUCCESS",
          attempts: 1,
          sentAt: new Date(),
        },
      });
    }
  }

  // 5. Audit Log Seed
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "SYSTEM_INITIALIZED",
      resource: "CommandOps",
      metadata: { seedVersion: "1.0.0", timestamp: new Date().toISOString() },
    },
  });

  console.log("🎉 Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
