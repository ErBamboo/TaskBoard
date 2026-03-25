import { canManageProjects, canMutateTask } from "@/lib/permissions";

test("member cannot manage projects", () => {
  expect(canManageProjects("member")).toBe(false);
});

test("assignee can update task status", () => {
  expect(
    canMutateTask({
      actorId: "user-1",
      actorRole: "member",
      assigneeId: "user-1",
      creatorId: "user-2",
    }),
  ).toBe(true);
});
