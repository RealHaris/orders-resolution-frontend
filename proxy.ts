import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/common/constants/shared/constants";

/**
 * Optimistic auth redirects. Real authorization is enforced by the API.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (pathname.startsWith("/dashboard") && !hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname === "/login" || pathname === "/signup") &&
    hasAccessToken
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
