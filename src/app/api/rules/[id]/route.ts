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
    const updated = await prisma.commandRule.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.conditions && { conditions: body.conditions }),
        ...(body.actions && { actions: body.actions }),
        ...(body.priority !== undefined && { priority: Number(body.priority) }),
        ...(body.isEnabled !== undefined && { isEnabled: Boolean(body.isEnabled) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.sub,
        action: "RULE_UPDATED",
        resource: "CommandRule",
        resourceId: id,
        metadata: body,
      },
    });

    return NextResponse.json({ rule: updated });
  }

  // Memory Fallback
  const rule = inMemoryStore.commandRules.find((r) => r.id === id);
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  Object.assign(rule, body);
  return NextResponse.json({ rule });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbConnected = await isDbConnected();

  if (dbConnected) {
    await prisma.commandRule.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        adminId: admin.sub,
        action: "RULE_DELETED",
        resource: "CommandRule",
        resourceId: id,
      },
    });
    return NextResponse.json({ success: true });
  }

  const index = inMemoryStore.commandRules.findIndex((r) => r.id === id);
  if (index !== -1) inMemoryStore.commandRules.splice(index, 1);
  return NextResponse.json({ success: true });
}
