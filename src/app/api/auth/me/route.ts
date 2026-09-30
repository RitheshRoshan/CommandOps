import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
