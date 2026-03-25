import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  buildLoginRedirectUrl,
  hasSupabaseAuthCookie,
  isProtectedRoute,
} from "@/lib/auth/route-guards";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", nextUrl.pathname);

  if (!isProtectedRoute(nextUrl.pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);

  if (hasSupabaseAuthCookie(cookieNames)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const redirectUrl = new URL(
    buildLoginRedirectUrl(`${nextUrl.pathname}${nextUrl.search}`),
    request.url,
  );

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
