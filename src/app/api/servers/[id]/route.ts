import { NextRequest, NextResponse } from "next/server";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const dbConnected = await isDbConnected();

  if (dbConnected) {
    const updated = await prisma.discordServer.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.mirrorWebhookUrl !== undefined && { mirrorWebhookUrl: body.mirrorWebhookUrl }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.sub,
        action: "SERVER_UPDATED",
        resource: "DiscordServer",
        resourceId: id,
        metadata: body,
      },
    });

    return NextResponse.json({ server: updated });
  }

  const server = inMemoryStore.discordServers.find((s) => s.id === id);
  if (!server) return NextResponse.json({ error: "Server not found" }, { status: 404 });

  Object.assign(server, body);
  return NextResponse.json({ server });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbConnected = await isDbConnected();

  if (dbConnected) {
    await prisma.discordServer.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        adminId: admin.sub,
        action: "SERVER_DISCONNECTED",
        resource: "DiscordServer",
        resourceId: id,
      },
    });
    return NextResponse.json({ success: true });
  }

  const index = inMemoryStore.discordServers.findIndex((s) => s.id === id);
  if (index !== -1) inMemoryStore.discordServers.splice(index, 1);
  return NextResponse.json({ success: true });
}
