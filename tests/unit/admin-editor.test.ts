import {
  buildMilestoneFormDefaults,
  buildProjectFormDefaults,
  buildSubsystemFormDefaults,
  resolveAdminScopeProjectId,
} from "@/features/admin/admin-editor";

test("resolves scope project id from available projects", () => {
  expect(
    resolveAdminScopeProjectId(
      [
        { id: "project-1", name: "Hero" },
        { id: "project-2", name: "Sentry" },
      ],
      "project-2",
    ),
  ).toBe("project-2");
});

test("falls back to first project when requested scope is missing", () => {
  expect(
    resolveAdminScopeProjectId(
      [
        { id: "project-1", name: "Hero" },
        { id: "project-2", name: "Sentry" },
      ],
      "project-3",
    ),
  ).toBe("project-1");
});

test("builds project edit defaults", () => {
  expect(
    buildProjectFormDefaults({
      project: {
        id: "project-1",
        name: "Hero Robot 2026",
        description: "Main robot.",
        status: "active",
        startDate: "2026-03-25",
        targetDate: "2026-05-20",
      },
    }),
  ).toEqual({
    projectId: "project-1",
    name: "Hero Robot 2026",
    description: "Main robot.",
    status: "active",
    startDate: "2026-03-25",
    targetDate: "2026-05-20",
  });
});

test("builds subsystem create defaults from scope project", () => {
  expect(
    buildSubsystemFormDefaults({
      scopeProjectId: "project-1",
      subsystem: null,
    }),
  ).toEqual({
    subsystemId: "",
    projectId: "project-1",
    name: "",
    description: "",
    sortOrder: 0,
  });
});

test("builds milestone edit defaults", () => {
  expect(
    buildMilestoneFormDefaults({
      scopeProjectId: "project-1",
      milestone: {
        id: "milestone-1",
        projectId: "project-2",
        name: "First Integration",
        description: "Integration checkpoint.",
        status: "active",
        dueDate: "2026-04-10",
      },
    }),
  ).toEqual({
    milestoneId: "milestone-1",
    projectId: "project-2",
    name: "First Integration",
    description: "Integration checkpoint.",
    status: "active",
    dueDate: "2026-04-10",
  });
});
