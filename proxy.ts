import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/common/constants/shared/constants";

/**
 * Request interceptor and auth route guard for Next.js 16.
 * - Redirects root (/) to /dashboard if logged in, or /login if not logged in.
 * - Protects /dashboard and subroutes by redirecting unauthenticated users to /login.
 * - Prevents authenticated users from accessing /login or /signup by redirecting to /dashboard.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (pathname === "/") {
    if (hasAccessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/dashboard") && !hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && hasAccessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
