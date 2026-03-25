import { describe, expect, it } from "vitest";

import {
  resolvePostSignInPath,
  shouldRedirectAdminToSetup,
} from "@/features/setup/setup-routing";

describe("setup routing", () => {
  it("redirects an uninitialized admin to the setup wizard after sign-in", () => {
    expect(
      resolvePostSignInPath({
        requestedPath: "/projects",
        role: "admin",
        isInitialized: false,
      }),
    ).toBe("/setup");
  });

  it("keeps member post-sign-in routing unchanged", () => {
    expect(
      resolvePostSignInPath({
        requestedPath: "/projects/robot-1",
        role: "member",
        isInitialized: false,
      }),
    ).toBe("/projects/robot-1");
  });

  it("keeps initialized admin post-sign-in routing unchanged", () => {
    expect(
      resolvePostSignInPath({
        requestedPath: "/projects/robot-1",
        role: "admin",
        isInitialized: true,
      }),
    ).toBe("/projects/robot-1");
  });

  it("forces only uninitialized admins into setup mode", () => {
    expect(
      shouldRedirectAdminToSetup({
        role: "admin",
        isInitialized: false,
      }),
    ).toBe(true);
    expect(
      shouldRedirectAdminToSetup({
        role: "admin",
        isInitialized: true,
      }),
    ).toBe(false);
    expect(
      shouldRedirectAdminToSetup({
        role: "member",
        isInitialized: false,
      }),
    ).toBe(false);
  });
});
