import {
  parseCreateMemberFormData,
  parseMilestoneFormData,
  parseProjectFormData,
  parseResetPasswordFormData,
  parseSubsystemFormData,
  parseToggleUserActiveFormData,
} from "@/features/admin/admin-form-schema";

test("normalizes optional project dates to null", () => {
  const formData = new FormData();
  formData.set("name", "Hero Robot 2026");
  formData.set("description", "Main competition robot.");
  formData.set("status", "active");
  formData.set("startDate", "");
  formData.set("targetDate", "");

  expect(parseProjectFormData(formData)).toEqual({
    projectId: null,
    name: "Hero Robot 2026",
    description: "Main competition robot.",
    status: "active",
    startDate: null,
    targetDate: null,
  });
});

test("converts subsystem sort order to a number", () => {
  const formData = new FormData();
  formData.set("projectId", "project-1");
  formData.set("name", "Vision");
  formData.set("description", "Target recognition.");
  formData.set("sortOrder", "3");

  expect(parseSubsystemFormData(formData)).toEqual({
    subsystemId: null,
    projectId: "project-1",
    name: "Vision",
    description: "Target recognition.",
    sortOrder: 3,
  });
});

test("normalizes milestone due date to null when empty", () => {
  const formData = new FormData();
  formData.set("projectId", "project-1");
  formData.set("name", "First Integration");
  formData.set("description", "Full robot integration checkpoint.");
  formData.set("status", "active");
  formData.set("dueDate", "");

  expect(parseMilestoneFormData(formData)).toEqual({
    milestoneId: null,
    projectId: "project-1",
    name: "First Integration",
    description: "Full robot integration checkpoint.",
    status: "active",
    dueDate: null,
  });
});

test("normalizes member email and trims display name", () => {
  const formData = new FormData();
  formData.set("displayName", "  Mechanical Lead  ");
  formData.set("email", "  MECH@ROBOT.LAB  ");
  formData.set("initialPassword", "robot-member-456");

  expect(parseCreateMemberFormData(formData)).toEqual({
    displayName: "Mechanical Lead",
    email: "mech@robot.lab",
    initialPassword: "robot-member-456",
  });
});

test("parses password reset payload", () => {
  const formData = new FormData();
  formData.set("userId", "user-1");
  formData.set("newPassword", "reset-pass-789");

  expect(parseResetPasswordFormData(formData)).toEqual({
    userId: "user-1",
    newPassword: "reset-pass-789",
  });
});

test("parses account toggle payload", () => {
  const formData = new FormData();
  formData.set("userId", "user-2");
  formData.set("nextIsActive", "false");

  expect(parseToggleUserActiveFormData(formData)).toEqual({
    userId: "user-2",
    nextIsActive: false,
  });
});
