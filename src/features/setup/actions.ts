"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth/get-session-user";
import { canManageProjects } from "@/lib/permissions";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getSetupState } from "@/features/setup/get-setup-state";
import {
  defaultSubsystemTemplates,
  initialSetupActionState,
  parseSetupWizardFormData,
  type SetupActionState,
} from "@/features/setup/setup-schema";

function formatSetupValidationMessage(error: ZodError) {
  const messages = [...new Set(error.issues.map((issue) => issue.message))];

  return messages.length > 0
    ? messages.join(" ")
    : "初始化数据校验失败，请检查输入内容。";
}

function buildTemporaryPassword() {
  return `Robot-${randomBytes(6).toString("base64url")}!`;
}

async function cleanupCreatedUsers(userIds: readonly string[]) {
  if (userIds.length === 0) {
    return;
  }

  const adminSupabaseClient = getAdminSupabaseClient();

  await Promise.all(
    userIds.map((userId) => adminSupabaseClient.auth.admin.deleteUser(userId)),
  );
}

export async function initializeWorkspaceAction(
  previousState: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !canManageProjects(sessionUser.role)) {
    return {
      ...previousState,
      status: "error",
      message: "只有管理员可以执行首次初始化。",
      temporaryCredentials: [],
    };
  }

  let parsedSetupWizard;

  try {
    parsedSetupWizard = parseSetupWizardFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatSetupValidationMessage(error),
        temporaryCredentials: [],
      };
    }

    throw error;
  }

  const setupState = await getSetupState();

  if (setupState.isInitialized) {
    return {
      ...previousState,
      status: "error",
      message: "系统已经完成初始化，不能重复执行首次向导。",
      temporaryCredentials: [],
    };
  }

  const supabaseClient = await getServerSupabaseClient();
  const requestedEmails = parsedSetupWizard.members.map((member) => member.email);
  const { data: existingUsers, error: existingUsersError } = await supabaseClient
    .from("user_profiles")
    .select("email")
    .in("email", requestedEmails);

  if (existingUsersError) {
    return {
      ...previousState,
      status: "error",
      message: existingUsersError.message,
      temporaryCredentials: [],
    };
  }

  if ((existingUsers ?? []).length > 0) {
    return {
      ...previousState,
      status: "error",
      message: `以下邮箱已存在：${existingUsers
        ?.map((user) => user.email)
        .join("、")}`,
      temporaryCredentials: [],
    };
  }

  const adminSupabaseClient = getAdminSupabaseClient();
  const createdUserIds: string[] = [];
  const createdProfiles: Array<{
    display_name: string;
    email: string;
    id: string;
    is_active: true;
    role: "member";
  }> = [];
  const temporaryCredentials: SetupActionState["temporaryCredentials"] = [];

  for (const member of parsedSetupWizard.members) {
    const temporaryPassword = buildTemporaryPassword();
    const { data: createdUserResult, error: createUserError } =
      await adminSupabaseClient.auth.admin.createUser({
        email: member.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          display_name: member.displayName,
        },
      });

    if (createUserError || !createdUserResult.user) {
      await cleanupCreatedUsers(createdUserIds);

      return {
        ...previousState,
        status: "error",
        message: createUserError?.message ?? "创建成员账号失败。",
        temporaryCredentials: [],
      };
    }

    createdUserIds.push(createdUserResult.user.id);
    createdProfiles.push({
      id: createdUserResult.user.id,
      email: member.email,
      display_name: member.displayName,
      role: "member",
      is_active: true,
    });
    temporaryCredentials.push({
      displayName: member.displayName,
      email: member.email,
      temporaryPassword,
    });
  }

  if (createdProfiles.length > 0) {
    const { error: createProfilesError } = await supabaseClient
      .from("user_profiles")
      .insert(createdProfiles);

    if (createProfilesError) {
      await cleanupCreatedUsers(createdUserIds);

      return {
        ...previousState,
        status: "error",
        message: createProfilesError.message,
        temporaryCredentials: [],
      };
    }
  }

  const { error: teamSettingsError } = await supabaseClient
    .from("team_settings")
    .upsert({
      id: 1,
      team_name: parsedSetupWizard.teamName,
      season_name: parsedSetupWizard.seasonName,
    });

  if (teamSettingsError) {
    return {
      ...previousState,
      status: "error",
      message: teamSettingsError.message,
      temporaryCredentials: [],
    };
  }

  const { data: createdProjects, error: createProjectsError } = await supabaseClient
    .from("projects")
    .insert(
      parsedSetupWizard.projects.map((project) => ({
        name: project.name,
        description: project.description,
        status: "active" as const,
      })),
    )
    .select("id, name");

  if (createProjectsError || !createdProjects) {
    return {
      ...previousState,
      status: "error",
      message: createProjectsError?.message ?? "创建初始项目失败。",
      temporaryCredentials: [],
    };
  }

  const subsystemRows = createdProjects.flatMap((project) =>
    defaultSubsystemTemplates.map((subsystemName, sortOrder) => ({
      project_id: project.id,
      name: subsystemName,
      description: `${project.name} 默认子系统模板`,
      sort_order: sortOrder,
    })),
  );

  if (subsystemRows.length > 0) {
    const { error: createSubsystemsError } = await supabaseClient
      .from("subsystems")
      .insert(subsystemRows);

    if (createSubsystemsError) {
      return {
        ...previousState,
        status: "error",
        message: createSubsystemsError.message,
        temporaryCredentials: [],
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath("/setup");

  return {
    status: "success",
    message: "首次初始化完成。请保存下列成员临时密码，并在发放后提醒成员登录修改。",
    temporaryCredentials,
  };
}

export { initialSetupActionState };
