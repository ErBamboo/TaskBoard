import { render, screen } from "@testing-library/react";
import { act } from "react";

import { DesktopRuntimeStatus } from "@/components/desktop/desktop-runtime-status";

function setNavigatorOnlineState(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => isOnline,
  });
}

test("renders desktop client version and online sync state", () => {
  setNavigatorOnlineState(true);

  render(<DesktopRuntimeStatus clientVersion="0.1.0" />);

  expect(screen.getByText("在线同步")).toBeInTheDocument();
  expect(screen.getByText("v0.1.0")).toBeInTheDocument();
});

test("switches to offline warning when the desktop client loses network", () => {
  setNavigatorOnlineState(true);

  render(<DesktopRuntimeStatus clientVersion="0.1.0" />);

  setNavigatorOnlineState(false);

  act(() => {
    window.dispatchEvent(new Event("offline"));
  });

  expect(screen.getByText("离线")).toBeInTheDocument();
  expect(
    screen.getByText("网络已断开，当前无法同步任务或提交变更。"),
  ).toBeInTheDocument();
});
