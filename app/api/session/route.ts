import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, USER_COOKIE } from "@/lib/constants";

/**
 * Bridges the client-driven login flow into cookies.
 *
 * NOTE on the httpOnly tradeoff: this app calls the Spring Boot API directly
 * from the browser (no Next.js backend proxy), so the token cookie CANNOT be
 * httpOnly — client-side fetch() needs to read it to attach the
 * `Authorization: Bearer <token>` header on every request. Both cookies
 * below are therefore readable client-side (SameSite=Lax + Secure in
 * production is the mitigation available at this layer). middleware.ts
 * reads the same cookie for route-gating. If you later add a Next.js API
 * proxy layer, move the token to a true httpOnly cookie and have the proxy
 * attach it server-side instead — flagged in FRONTEND_TODO.md.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, userId, username, fullName, roleName, expiresAt } = body ?? {};

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Server-side token TTL is 120 minutes; let the cookie outlive that
    // slightly so our own 30-minute idle logic is what actually governs UX.
    maxAge: 60 * 60 * 3,
  };

  response.cookies.set(SESSION_COOKIE, token, cookieOptions);
  response.cookies.set(
    USER_COOKIE,
    JSON.stringify({ userId, username, fullName, roleName, expiresAt }),
    cookieOptions
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}
