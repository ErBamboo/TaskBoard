import { render, screen } from "@testing-library/react";

import { WelcomeLanding } from "@/features/home/welcome-landing";

test("renders mission-driven welcome landing with primary actions", () => {
  render(<WelcomeLanding />);

  expect(screen.getByText("战队任务中枢")).toBeInTheDocument();
  expect(
    screen.getByText("为机器人竞赛项目、联调和里程碑准备的在线作战面板。"),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "进入任务面板" })).toHaveAttribute(
    "href",
    "/login",
  );
  expect(screen.getByRole("button", { name: "安装到设备" })).toBeInTheDocument();
});

test("renders tactical capability cards", () => {
  render(<WelcomeLanding />);

  expect(screen.getByText("我的任务")).toBeInTheDocument();
  expect(screen.getByText("项目战况")).toBeInTheDocument();
  expect(screen.getByText("联调预警")).toBeInTheDocument();
  expect(screen.getByText("里程碑推进")).toBeInTheDocument();
});
