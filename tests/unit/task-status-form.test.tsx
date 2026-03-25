import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { TaskStatusForm } from "@/components/task-status-form";

vi.mock("@/features/tasks/actions", () => ({
  initialTaskActionState: {
    message: "",
    status: "idle",
  },
  updateTaskStatusAction: vi.fn(),
}));

test("reveals blocked reason input when status changes to blocked", async () => {
  const user = userEvent.setup();

  render(
    <TaskStatusForm
      blockedReason=""
      currentStatus="todo"
      taskId="task-1"
    />,
  );

  expect(screen.queryByLabelText("阻塞原因")).not.toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("任务状态"), "blocked");

  expect(screen.getByLabelText("阻塞原因")).toBeInTheDocument();
});

test("shows initial blocked reason when task is already blocked", () => {
  render(
    <TaskStatusForm
      blockedReason="等待机械组确认安装孔位。"
      currentStatus="blocked"
      taskId="task-2"
    />,
  );

  expect(screen.getByLabelText("阻塞原因")).toHaveValue(
    "等待机械组确认安装孔位。",
  );
});
