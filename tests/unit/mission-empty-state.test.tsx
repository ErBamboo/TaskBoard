import { render, screen } from "@testing-library/react";

import { MissionEmptyState } from "@/components/mission-empty-state";

test("renders mission empty state with action link", () => {
  render(
    <MissionEmptyState
      title="当前暂无指派任务"
      description="等待管理员分配或先查看项目战况。"
      action={{
        href: "/projects",
        label: "查看项目战况",
      }}
      eyebrow="Stand by"
    />,
  );

  expect(screen.getByText("当前暂无指派任务")).toBeInTheDocument();
  expect(screen.getByText("等待管理员分配或先查看项目战况。")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "查看项目战况" })).toHaveAttribute(
    "href",
    "/projects",
  );
});
