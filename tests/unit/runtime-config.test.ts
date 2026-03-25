import { describe, expect, it } from "vitest";

import { parseDesktopRuntimeConfiguration } from "@/lib/desktop/runtime-config";

describe("parseDesktopRuntimeConfiguration", () => {
  it("accepts a fixed remote service URL for desktop builds", () => {
    expect(
      parseDesktopRuntimeConfiguration({
        NEXT_PUBLIC_DESKTOP_APP_URL: "https://task-board.example.com",
      }),
    ).toEqual({
      appUrl: "https://task-board.example.com",
    });
  });

  it("rejects invalid desktop service URLs", () => {
    expect(() =>
      parseDesktopRuntimeConfiguration({
        NEXT_PUBLIC_DESKTOP_APP_URL: "not-a-url",
      }),
    ).toThrow();
  });
});
