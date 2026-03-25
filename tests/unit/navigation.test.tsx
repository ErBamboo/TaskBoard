import { render, screen } from "@testing-library/react";

import { Navigation } from "@/components/navigation";

test("member navigation omits admin entry", () => {
  render(<Navigation currentPath="/my-tasks" role="member" />);

  expect(screen.getByRole("link", { name: "我的任务" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "项目" })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", {
      name: "管理",
    }),
  ).not.toBeInTheDocument();
});

test("admin navigation includes admin entry", () => {
  render(<Navigation currentPath="/admin" role="admin" />);

  expect(screen.getByRole("link", { name: "管理" })).toBeInTheDocument();
});
