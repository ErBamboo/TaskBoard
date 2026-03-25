import { describe, expect, it } from "vitest";

import { setupWizardSchema } from "@/features/setup/setup-schema";

describe("setupWizardSchema", () => {
  it("accepts a valid first-run initialization payload", () => {
    expect(
      setupWizardSchema.parse({
        teamName: "Oh My Robot",
        seasonName: "2026 赛季",
        projects: [{ name: "英雄机器人", description: "" }],
        members: [{ displayName: "Alice", email: "alice@example.com" }],
      }),
    ).toBeTruthy();
  });
});
