import type { DashboardTask } from "@/features/dashboard/get-my-task-dashboard";
import { groupTasksByStatus } from "@/features/dashboard/get-my-task-dashboard";

const dashboardTasks: DashboardTask[] = [
  {
    id: "task-1",
    title: "Mount chassis plate",
    status: "todo",
    priority: "high",
    projectName: "Hero Robot",
    subsystemName: "Chassis",
    milestoneName: "First Integration",
    dueAt: "2026-03-30T08:00:00.000Z",
    isIntegrationTask: false,
    blockedReason: "",
  },
  {
    id: "task-2",
    title: "Tune serial protocol",
    status: "blocked",
    priority: "urgent",
    projectName: "Hero Robot",
    subsystemName: "Embedded",
    milestoneName: "First Integration",
    dueAt: "2026-03-28T08:00:00.000Z",
    isIntegrationTask: true,
    blockedReason: "Waiting for algorithm output format.",
  },
  {
    id: "task-3",
    title: "Indoor recognition validation",
    status: "done",
    priority: "medium",
    projectName: "Vision Platform",
    subsystemName: "Vision",
    milestoneName: null,
    dueAt: null,
    isIntegrationTask: false,
    blockedReason: "",
  },
];

test("groups dashboard tasks into four status columns", () => {
  const groupedTasks = groupTasksByStatus(dashboardTasks);

  expect(groupedTasks.todo).toHaveLength(1);
  expect(groupedTasks.in_progress).toHaveLength(0);
  expect(groupedTasks.blocked).toHaveLength(1);
  expect(groupedTasks.done).toHaveLength(1);
});
