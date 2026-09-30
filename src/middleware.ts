import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = req.cookies.get("commandops_session");
    // If no session cookie exists and not in explicit bypass mode, redirect to /login
    if (!sessionCookie && process.env.DEMO_MODE !== "true") {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
