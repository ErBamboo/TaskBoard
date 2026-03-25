import { describe, expect, it } from "vitest";

import { hasPublicEnvironmentConfiguration, parseEnvironment } from "@/lib/env";

describe("parseEnvironment", () => {
  it("throws when required variables are missing", () => {
    expect(() =>
      parseEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      }),
    ).toThrow();
  });
});

describe("hasPublicEnvironmentConfiguration", () => {
  it("returns false when public supabase variables are missing", () => {
    expect(
      hasPublicEnvironmentConfiguration({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toBe(false);
  });
});
