import { describe, expect, it } from "vitest";

import {
  getDesktopClientVersionFromUserAgent,
  isDesktopClientUserAgent,
} from "@/lib/desktop/is-desktop-client";

describe("isDesktopClientUserAgent", () => {
  it("detects the desktop shell user agent marker", () => {
    expect(isDesktopClientUserAgent("RobotTaskBoardDesktop/1.0")).toBe(true);
  });

  it("does not classify normal browsers as desktop shell", () => {
    expect(isDesktopClientUserAgent("Mozilla/5.0 Chrome/136.0")).toBe(false);
  });

  it("extracts the desktop client version from the user agent", () => {
    expect(
      getDesktopClientVersionFromUserAgent("RobotTaskBoardDesktop/0.1.0"),
    ).toBe("0.1.0");
    expect(getDesktopClientVersionFromUserAgent("Mozilla/5.0")).toBeNull();
  });
});
