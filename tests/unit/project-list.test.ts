import { buildProjectCardSummaries } from "@/features/projects/get-project-list";

test("builds project card summary counts from project tasks and milestones", () => {
  const projectCardSummaries = buildProjectCardSummaries([
    {
      id: "project-1",
      name: "Hero Robot",
      description: "Main competition robot",
      status: "active",
      targetDate: "2026-05-30",
      milestones: [
        { id: "milestone-1", status: "active" },
        { id: "milestone-2", status: "completed" },
      ],
      tasks: [
        { id: "task-1", status: "todo", isIntegrationTask: false },
        { id: "task-2", status: "blocked", isIntegrationTask: true },
        { id: "task-3", status: "done", isIntegrationTask: false },
      ],
    },
  ]);

  expect(projectCardSummaries[0]).toMatchObject({
    blockedTaskCount: 1,
    integrationTaskCount: 1,
    milestoneCount: 2,
    openTaskCount: 2,
  });
});
