import {
  filterProjectBoardTasks,
  groupProjectBoardTasksByStatus,
} from "@/features/projects/get-project-board";

const projectBoardTasks = [
  {
    id: "task-1",
    title: "Chassis tuning",
    status: "in_progress",
    priority: "high",
    subsystemId: "subsystem-1",
    subsystemName: "Chassis",
    assigneeId: "user-1",
    assigneeName: "Mechanical Lead",
    milestoneName: "First Integration",
    blockedReason: "",
    canEdit: true,
    canUpdateStatus: true,
    isIntegrationTask: false,
    dueAt: "2026-03-30T08:00:00.000Z",
  },
  {
    id: "task-2",
    title: "Protocol alignment",
    status: "blocked",
    priority: "urgent",
    subsystemId: "subsystem-2",
    subsystemName: "Embedded",
    assigneeId: "user-2",
    assigneeName: "Embedded Lead",
    milestoneName: "First Integration",
    blockedReason: "Waiting for algorithm data format.",
    canEdit: false,
    canUpdateStatus: false,
    isIntegrationTask: true,
    dueAt: "2026-03-29T08:00:00.000Z",
  },
  {
    id: "task-3",
    title: "Model validation",
    status: "todo",
    priority: "medium",
    subsystemId: "subsystem-3",
    subsystemName: "Vision",
    assigneeId: "user-3",
    assigneeName: "Algorithm Lead",
    milestoneName: null,
    blockedReason: "",
    canEdit: true,
    canUpdateStatus: true,
    isIntegrationTask: false,
    dueAt: null,
  },
] as const;

test("filters project board tasks by subsystem and status", () => {
  const filteredProjectBoardTasks = filterProjectBoardTasks(projectBoardTasks, {
    assigneeId: "",
    priority: "",
    status: "blocked",
    subsystemId: "subsystem-2",
  });

  expect(filteredProjectBoardTasks).toHaveLength(1);
  expect(filteredProjectBoardTasks[0]?.title).toBe("Protocol alignment");
});

test("groups project board tasks into status columns", () => {
  const groupedProjectBoardTasks = groupProjectBoardTasksByStatus(
    projectBoardTasks,
  );

  expect(groupedProjectBoardTasks.todo).toHaveLength(1);
  expect(groupedProjectBoardTasks.in_progress).toHaveLength(1);
  expect(groupedProjectBoardTasks.blocked).toHaveLength(1);
  expect(groupedProjectBoardTasks.done).toHaveLength(0);
});
