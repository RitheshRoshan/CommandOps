import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyPassword } from "@/lib/auth";
import { prisma, inMemoryStore, isDbConnected } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const isDemoMode = process.env.DEMO_MODE === "true";
    const isProd = process.env.NODE_ENV === "production";
    const dbConnected = await isDbConnected();

    if (!dbConnected && isProd && !isDemoMode) {
      return NextResponse.json({ error: "Database Unavailable" }, { status: 503 });
    }

    let adminUser = null;

    if (dbConnected) {
      adminUser = await prisma.adminUser.findUnique({ where: { email } });
    } else if (isDemoMode) {
      adminUser = inMemoryStore.adminUsers.find((u) => u.email === email);
    }

    // Demo Mode Fallback Credentials Guard
    if (!adminUser && isDemoMode) {
      const defaultAdminEmail = process.env.ADMIN_EMAIL || "admin@commandops.io";
      const defaultAdminPass = process.env.ADMIN_PASSWORD;

      if (defaultAdminPass && email === defaultAdminEmail && password === defaultAdminPass) {
        adminUser = {
          id: "admin-demo-id",
          email: defaultAdminEmail,
          name: "CommandOps Admin",
          role: "ADMIN",
        };
      }
    }

    if (!adminUser) {
      logger.warn({ event: "admin.login_failed", email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify Password against hash if passwordHash exists
    if (adminUser.passwordHash) {
      const isValid = await verifyPassword(password, adminUser.passwordHash);
      if (!isValid) {
        logger.warn({ event: "admin.login_failed", email });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const token = await signToken({
      sub: adminUser.id,
      email: adminUser.email,
      name: adminUser.name || "Admin",
      role: adminUser.role || "ADMIN",
    });

    logger.info({ event: "admin.login_success", adminId: adminUser.id, email: adminUser.email });

    const res = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });

    res.cookies.set("commandops_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
