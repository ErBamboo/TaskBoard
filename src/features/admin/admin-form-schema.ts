import { z } from "zod";

import type { MilestoneStatus, ProjectStatus } from "@/types/database";

const projectStatusSchema = z.enum(["planning", "active", "archived"]);
const milestoneStatusSchema = z.enum(["pending", "active", "completed"]);

const projectFormSchema = z.object({
  projectId: z.string().optional().transform((value) => value || null),
  name: z.string().trim().min(1, "请输入项目名称。"),
  description: z.string().trim().default(""),
  status: projectStatusSchema,
  startDate: z.string().optional().transform((value) => value || null),
  targetDate: z.string().optional().transform((value) => value || null),
});

const subsystemFormSchema = z.object({
  subsystemId: z.string().optional().transform((value) => value || null),
  projectId: z.string().min(1, "请选择所属项目。"),
  name: z.string().trim().min(1, "请输入子系统名称。"),
  description: z.string().trim().default(""),
  sortOrder: z.coerce.number().int().min(0, "排序必须为非负整数。"),
});

const milestoneFormSchema = z.object({
  milestoneId: z.string().optional().transform((value) => value || null),
  projectId: z.string().min(1, "请选择所属项目。"),
  name: z.string().trim().min(1, "请输入里程碑名称。"),
  description: z.string().trim().default(""),
  status: milestoneStatusSchema,
  dueDate: z.string().optional().transform((value) => value || null),
});

const createMemberFormSchema = z.object({
  displayName: z.string().trim().min(1, "请输入成员姓名。"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("请输入有效邮箱地址。"),
  initialPassword: z.string().min(8, "初始密码至少需要 8 位。"),
});

const resetPasswordFormSchema = z.object({
  userId: z.string().min(1, "缺少用户标识。"),
  newPassword: z.string().min(8, "新密码至少需要 8 位。"),
});

const toggleUserActiveFormSchema = z.object({
  userId: z.string().min(1, "缺少用户标识。"),
  nextIsActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export type AdminActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

export type ProjectFormValues = {
  description: string;
  name: string;
  projectId: string | null;
  startDate: string | null;
  status: ProjectStatus;
  targetDate: string | null;
};

export type SubsystemFormValues = {
  description: string;
  name: string;
  projectId: string;
  sortOrder: number;
  subsystemId: string | null;
};

export type MilestoneFormValues = {
  description: string;
  dueDate: string | null;
  milestoneId: string | null;
  name: string;
  projectId: string;
  status: MilestoneStatus;
};

export type CreateMemberFormValues = {
  displayName: string;
  email: string;
  initialPassword: string;
};

export type ResetPasswordFormValues = {
  newPassword: string;
  userId: string;
};

export type ToggleUserActiveFormValues = {
  nextIsActive: boolean;
  userId: string;
};

export const initialAdminActionState: AdminActionState = {
  message: "",
  status: "idle",
};

export function parseProjectFormData(formData: FormData): ProjectFormValues {
  return projectFormSchema.parse({
    projectId: formData.get("projectId")?.toString(),
    name: formData.get("name")?.toString(),
    description: formData.get("description")?.toString() ?? "",
    status: formData.get("status")?.toString(),
    startDate: formData.get("startDate")?.toString(),
    targetDate: formData.get("targetDate")?.toString(),
  });
}

export function parseSubsystemFormData(formData: FormData): SubsystemFormValues {
  return subsystemFormSchema.parse({
    subsystemId: formData.get("subsystemId")?.toString(),
    projectId: formData.get("projectId")?.toString(),
    name: formData.get("name")?.toString(),
    description: formData.get("description")?.toString() ?? "",
    sortOrder: formData.get("sortOrder")?.toString(),
  });
}

export function parseMilestoneFormData(formData: FormData): MilestoneFormValues {
  return milestoneFormSchema.parse({
    milestoneId: formData.get("milestoneId")?.toString(),
    projectId: formData.get("projectId")?.toString(),
    name: formData.get("name")?.toString(),
    description: formData.get("description")?.toString() ?? "",
    status: formData.get("status")?.toString(),
    dueDate: formData.get("dueDate")?.toString(),
  });
}

export function parseCreateMemberFormData(
  formData: FormData,
): CreateMemberFormValues {
  return createMemberFormSchema.parse({
    displayName: formData.get("displayName")?.toString(),
    email: formData.get("email")?.toString(),
    initialPassword: formData.get("initialPassword")?.toString(),
  });
}

export function parseResetPasswordFormData(
  formData: FormData,
): ResetPasswordFormValues {
  return resetPasswordFormSchema.parse({
    userId: formData.get("userId")?.toString(),
    newPassword: formData.get("newPassword")?.toString(),
  });
}

export function parseToggleUserActiveFormData(
  formData: FormData,
): ToggleUserActiveFormValues {
  return toggleUserActiveFormSchema.parse({
    userId: formData.get("userId")?.toString(),
    nextIsActive: formData.get("nextIsActive")?.toString(),
  });
}
