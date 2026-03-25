import { sanitizeRedirectPath } from "@/lib/auth/route-guards";
import type { UserRole } from "@/lib/permissions";

type SetupRoutingProperties = {
  isInitialized: boolean;
  role: UserRole;
};

type SetupPageMode = "completed" | "redirect" | "wizard";

type SetupPageRoutingProperties = {
  isInitialized: boolean;
  role: UserRole | null;
};

type PostSignInRoutingProperties = SetupRoutingProperties & {
  requestedPath: string | null | undefined;
};

export function shouldRedirectAdminToSetup({
  role,
  isInitialized,
}: SetupRoutingProperties) {
  return role === "admin" && !isInitialized;
}

export function resolveSetupPageMode({
  role,
  isInitialized,
}: SetupPageRoutingProperties): SetupPageMode {
  if (role !== "admin") {
    return "redirect";
  }

  if (isInitialized) {
    return "completed";
  }

  return "wizard";
}

export function resolvePostSignInPath({
  requestedPath,
  role,
  isInitialized,
}: PostSignInRoutingProperties) {
  if (shouldRedirectAdminToSetup({ role, isInitialized })) {
    return "/setup";
  }

  return sanitizeRedirectPath(requestedPath);
}
