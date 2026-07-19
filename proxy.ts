import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = ["/login", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "unauthenticated");
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (session route handler needs to run unauthenticated too)
     * - _next/static, _next/image, favicon.ico, and other static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
