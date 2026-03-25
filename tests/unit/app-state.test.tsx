import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import AppError from "@/app/(app)/error";
import AppLoading from "@/app/(app)/loading";

test("app loading renders control room loading copy", () => {
  render(<AppLoading />);

  expect(screen.getByText("控制台载入中")).toBeInTheDocument();
  expect(
    screen.getByText("正在同步任务、项目和管理员配置。"),
  ).toBeInTheDocument();
});

test("app error offers a retry action", async () => {
  const user = userEvent.setup();
  const reset = vi.fn();

  render(<AppError error={new Error("load failed")} reset={reset} />);

  await user.click(screen.getByRole("button", { name: "重新载入" }));

  expect(reset).toHaveBeenCalledTimes(1);
});
