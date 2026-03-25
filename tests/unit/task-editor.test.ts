import {
  buildTaskFormDefaults,
  filterRelatedTaskOptions,
} from "@/features/tasks/task-editor";

test("builds create defaults for a new task", () => {
  const taskFormDefaults = buildTaskFormDefaults({
    projectId: "project-1",
    task: null,
  });

  expect(taskFormDefaults).toEqual({
    taskId: "",
    projectId: "project-1",
    title: "",
    description: "",
    subsystemId: "",
    milestoneId: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    groupTag: "",
    isIntegrationTask: false,
    blockedReason: "",
    dueAt: "",
    relatedTaskId: "",
    relationType: "",
  });
});

test("builds edit defaults from an existing task", () => {
  const taskFormDefaults = buildTaskFormDefaults({
    projectId: "project-1",
    task: {
      id: "task-1",
      title: "Integrate serial protocol",
      description: "Complete firmware parsing for vision packets.",
      subsystemId: "subsystem-1",
      milestoneId: "milestone-1",
      assigneeId: "user-2",
      status: "blocked",
      priority: "high",
      groupTag: "embedded",
      isIntegrationTask: true,
      blockedReason: "Waiting for algorithm fields.",
      dueAt: "2026-03-30T08:00:00.000Z",
      relation: {
        relatedTaskId: "task-9",
        relationType: "depends_on",
      },
    },
  });

  expect(taskFormDefaults).toEqual({
    taskId: "task-1",
    projectId: "project-1",
    title: "Integrate serial protocol",
    description: "Complete firmware parsing for vision packets.",
    subsystemId: "subsystem-1",
    milestoneId: "milestone-1",
    assigneeId: "user-2",
    status: "blocked",
    priority: "high",
    groupTag: "embedded",
    isIntegrationTask: true,
    blockedReason: "Waiting for algorithm fields.",
    dueAt: "2026-03-30T16:00",
    relatedTaskId: "task-9",
    relationType: "depends_on",
  });
});

test("filters related task options to exclude the edited task itself", () => {
  const relatedTaskOptions = filterRelatedTaskOptions("task-2", [
    {
      id: "task-1",
      title: "Chassis tuning",
      subsystemName: "Chassis",
    },
    {
      id: "task-2",
      title: "Protocol alignment",
      subsystemName: "Embedded",
    },
  ]);

  expect(relatedTaskOptions).toEqual([
    {
      id: "task-1",
      title: "Chassis tuning",
      subsystemName: "Chassis",
    },
  ]);
});
