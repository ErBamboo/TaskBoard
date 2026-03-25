import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
const taskRelationTypeSchema = z.enum([
  "depends_on",
  "related_to",
  "integration_input",
]);

export const taskStatusOptions = [
  { label: "待开始", value: "todo" },
  { label: "进行中", value: "in_progress" },
  { label: "阻塞", value: "blocked" },
  { label: "已完成", value: "done" },
] as const;

export const taskPriorityOptions = [
  { label: "低", value: "low" },
  { label: "中", value: "medium" },
  { label: "高", value: "high" },
  { label: "紧急", value: "urgent" },
] as const;

export const taskRelationTypeOptions = [
  { label: "依赖", value: "depends_on" },
  { label: "关联", value: "related_to" },
  { label: "联调输入", value: "integration_input" },
] as const;

const taskFormSchema = z
  .object({
    taskId: z.string().optional().transform((value) => value || null),
    projectId: z.string().min(1, "缺少项目标识。"),
    title: z.string().trim().min(1, "请输入任务标题。"),
    description: z.string().trim().default(""),
    subsystemId: z.string().min(1, "请选择子系统。"),
    milestoneId: z.string().optional().transform((value) => value || null),
    assigneeId: z.string().min(1, "请选择负责人。"),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    groupTag: z.string().trim().min(1, "请输入技术组标签。"),
    isIntegrationTask: z.boolean(),
    blockedReason: z.string().trim().optional().default(""),
    dueAt: z.string().optional().transform((value) => value || null),
    relatedTaskId: z.string().optional().transform((value) => value || null),
    relationType: taskRelationTypeSchema
      .optional()
      .transform((value) => value || null),
  })
  .superRefine((value, context) => {
    if (value.status === "blocked" && !value.blockedReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "阻塞状态必须填写阻塞原因。",
        path: ["blockedReason"],
      });
    }

    if (value.relatedTaskId && !value.relationType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "选择关联任务时必须指定关系类型。",
        path: ["relationType"],
      });
    }
  });

const taskStatusFormSchema = z
  .object({
    taskId: z.string().min(1, "缺少任务标识。"),
    status: taskStatusSchema,
    blockedReason: z.string().trim().optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.status === "blocked" && !value.blockedReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "阻塞状态必须填写阻塞原因。",
        path: ["blockedReason"],
      });
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskStatusFormValues = z.infer<typeof taskStatusFormSchema>;

export type TaskActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const initialTaskActionState: TaskActionState = {
  message: "",
  status: "idle",
};

function toNullableDateString(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function parseTaskFormData(formData: FormData): TaskFormValues {
  const parsedTaskForm = taskFormSchema.parse({
    taskId: formData.get("taskId")?.toString(),
    projectId: formData.get("projectId")?.toString(),
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString() ?? "",
    subsystemId: formData.get("subsystemId")?.toString(),
    milestoneId: formData.get("milestoneId")?.toString(),
    assigneeId: formData.get("assigneeId")?.toString(),
    status: formData.get("status")?.toString(),
    priority: formData.get("priority")?.toString(),
    groupTag: formData.get("groupTag")?.toString(),
    isIntegrationTask: formData.get("isIntegrationTask") === "on",
    blockedReason: formData.get("blockedReason")?.toString() ?? "",
    dueAt: formData.get("dueAt")?.toString(),
    relatedTaskId: formData.get("relatedTaskId")?.toString(),
    relationType: formData.get("relationType")?.toString(),
  });

  return {
    ...parsedTaskForm,
    blockedReason:
      parsedTaskForm.status === "blocked" ? parsedTaskForm.blockedReason : "",
    dueAt: toNullableDateString(parsedTaskForm.dueAt),
  };
}

export function parseTaskStatusFormData(formData: FormData): TaskStatusFormValues {
  const parsedTaskStatusForm = taskStatusFormSchema.parse({
    taskId: formData.get("taskId")?.toString(),
    status: formData.get("status")?.toString(),
    blockedReason: formData.get("blockedReason")?.toString() ?? "",
  });

  return {
    ...parsedTaskStatusForm,
    blockedReason:
      parsedTaskStatusForm.status === "blocked"
        ? parsedTaskStatusForm.blockedReason
        : "",
  };
}
