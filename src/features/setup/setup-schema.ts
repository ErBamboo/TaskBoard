import { z } from "zod";

const setupProjectSchema = z.object({
  name: z.string().trim().min(1, "请输入项目名称。"),
  description: z.string().trim().default(""),
});

const setupMemberSchema = z.object({
  displayName: z.string().trim().min(1, "请输入成员姓名。"),
  email: z.string().trim().toLowerCase().email("请输入有效邮箱地址。"),
});

export const defaultSubsystemTemplates = [
  "底盘",
  "云台",
  "发射机构",
  "视觉",
  "通信",
  "电源",
  "上位机",
] as const;

export const setupWizardSchema = z
  .object({
    teamName: z.string().trim().min(1, "请输入战队名称。"),
    seasonName: z.string().trim().min(1, "请输入赛季名称。"),
    projects: z
      .array(setupProjectSchema)
      .min(1, "至少需要创建 1 个初始项目。")
      .max(3, "初始项目最多创建 3 个。"),
    members: z
      .array(setupMemberSchema)
      .min(1, "至少需要导入 1 位成员。")
      .max(20, "初始成员最多导入 20 位。"),
  })
  .superRefine((value, context) => {
    const projectNames = new Set<string>();
    const memberEmails = new Set<string>();

    value.projects.forEach((project, index) => {
      if (projectNames.has(project.name)) {
        context.addIssue({
          code: "custom",
          message: "项目名称不能重复。",
          path: ["projects", index, "name"],
        });
        return;
      }

      projectNames.add(project.name);
    });

    value.members.forEach((member, index) => {
      if (memberEmails.has(member.email)) {
        context.addIssue({
          code: "custom",
          message: "成员邮箱不能重复。",
          path: ["members", index, "email"],
        });
        return;
      }

      memberEmails.add(member.email);
    });
  });

export type SetupProjectInput = z.infer<typeof setupProjectSchema>;
export type SetupMemberInput = z.infer<typeof setupMemberSchema>;
export type SetupWizardValues = z.infer<typeof setupWizardSchema>;

export type SetupActionState = {
  message: string;
  status: "error" | "idle" | "success";
  temporaryCredentials: Array<{
    displayName: string;
    email: string;
    temporaryPassword: string;
  }>;
};

export const initialSetupActionState: SetupActionState = {
  message: "",
  status: "idle",
  temporaryCredentials: [],
};

function parseJsonField(
  serializedValue: FormDataEntryValue | null,
  fallbackValue: unknown,
) {
  if (typeof serializedValue !== "string" || serializedValue.trim().length === 0) {
    return fallbackValue;
  }

  return JSON.parse(serializedValue);
}

export function parseSetupWizardFormData(
  formData: FormData,
): SetupWizardValues {
  return setupWizardSchema.parse({
    teamName: formData.get("teamName")?.toString(),
    seasonName: formData.get("seasonName")?.toString(),
    projects: parseJsonField(formData.get("projects"), []),
    members: parseJsonField(formData.get("members"), []),
  });
}
