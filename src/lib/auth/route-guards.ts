const protectedRoutePrefixes = ["/my-tasks", "/projects", "/admin", "/setup"] as const;

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((protectedRoutePrefix) =>
    pathname === protectedRoutePrefix ||
    pathname.startsWith(`${protectedRoutePrefix}/`),
  );
}

export function hasSupabaseAuthCookie(cookieNames: string[]) {
  return cookieNames.some(
    (cookieName) =>
      cookieName.startsWith("sb-") && cookieName.includes("auth-token"),
  );
}

export function buildLoginRedirectUrl(requestedPath: string) {
  const normalizedPath = requestedPath.startsWith("/")
    ? requestedPath
    : `/${requestedPath}`;

  return `/login?redirectTo=${encodeURIComponent(normalizedPath)}`;
}

export function sanitizeRedirectPath(redirectPath: string | null | undefined) {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/my-tasks";
  }

  return redirectPath;
}
