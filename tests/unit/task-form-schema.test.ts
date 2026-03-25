import {
  parseTaskFormData,
  parseTaskStatusFormData,
} from "@/features/tasks/task-form-schema";

test("task form requires blocked reason when status is blocked", () => {
  const formData = new FormData();
  formData.set("projectId", "project-1");
  formData.set("title", "Integrate serial protocol");
  formData.set("description", "Wire algorithm output into firmware.");
  formData.set("subsystemId", "subsystem-1");
  formData.set("assigneeId", "user-1");
  formData.set("status", "blocked");
  formData.set("priority", "high");
  formData.set("groupTag", "embedded");

  expect(() => parseTaskFormData(formData)).toThrow();
});

test("task form normalizes optional values", () => {
  const formData = new FormData();
  formData.set("projectId", "project-1");
  formData.set("title", "Integrate serial protocol");
  formData.set("description", "Wire algorithm output into firmware.");
  formData.set("subsystemId", "subsystem-1");
  formData.set("assigneeId", "user-1");
  formData.set("milestoneId", "");
  formData.set("status", "in_progress");
  formData.set("priority", "high");
  formData.set("groupTag", "embedded");
  formData.set("dueAt", "");
  formData.set("relatedTaskId", "task-2");
  formData.set("relationType", "depends_on");

  expect(parseTaskFormData(formData)).toMatchObject({
    milestoneId: null,
    dueAt: null,
    relatedTaskId: "task-2",
    relationType: "depends_on",
  });
});

test("task status form requires blocked reason only for blocked status", () => {
  const blockedFormData = new FormData();
  blockedFormData.set("taskId", "task-1");
  blockedFormData.set("status", "blocked");
  blockedFormData.set("blockedReason", "");

  expect(() => parseTaskStatusFormData(blockedFormData)).toThrow();

  const inProgressFormData = new FormData();
  inProgressFormData.set("taskId", "task-1");
  inProgressFormData.set("status", "in_progress");

  expect(parseTaskStatusFormData(inProgressFormData)).toMatchObject({
    blockedReason: "",
    status: "in_progress",
    taskId: "task-1",
  });
});
