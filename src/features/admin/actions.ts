"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import {
  parseCreateMemberFormData,
  parseMilestoneFormData,
  parseProjectFormData,
  parseResetPasswordFormData,
  parseSubsystemFormData,
  parseToggleUserActiveFormData,
  type AdminActionState,
} from "@/features/admin/admin-form-schema";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { canManageProjects } from "@/lib/permissions";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

function formatValidationMessage(error: ZodError) {
  const messages = [...new Set(error.issues.map((issue) => issue.message))];

  return messages.length > 0
    ? messages.join(" ")
    : "表单校验失败，请检查输入内容。";
}

async function ensureAdminActionState(previousState: AdminActionState) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !canManageProjects(sessionUser.role)) {
    return {
      sessionUser: null,
      errorState: {
        ...previousState,
        status: "error" as const,
        message: "只有管理员可以执行这项操作。",
      },
    };
  }

  return {
    sessionUser,
    errorState: null,
  };
}

function revalidateAdminViews(projectId?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/projects");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function upsertProjectAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedProjectForm;

  try {
    parsedProjectForm = parseProjectFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const supabaseClient = await getServerSupabaseClient();

  if (parsedProjectForm.projectId) {
    const { error } = await supabaseClient
      .from("projects")
      .update({
        name: parsedProjectForm.name,
        description: parsedProjectForm.description,
        status: parsedProjectForm.status,
        start_date: parsedProjectForm.startDate,
        target_date: parsedProjectForm.targetDate,
      })
      .eq("id", parsedProjectForm.projectId);

    if (error) {
      return {
        ...previousState,
        status: "error",
        message: error.message,
      };
    }

    revalidateAdminViews(parsedProjectForm.projectId);

    return {
      status: "success",
      message: "项目已更新。",
    };
  }

  const { error } = await supabaseClient.from("projects").insert({
    name: parsedProjectForm.name,
    description: parsedProjectForm.description,
    status: parsedProjectForm.status,
    start_date: parsedProjectForm.startDate,
    target_date: parsedProjectForm.targetDate,
  });

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: error.message,
    };
  }

  revalidateAdminViews();

  return {
    status: "success",
    message: "项目已创建。",
  };
}

export async function upsertSubsystemAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedSubsystemForm;

  try {
    parsedSubsystemForm = parseSubsystemFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data: projectRecord } = await supabaseClient
    .from("projects")
    .select("id")
    .eq("id", parsedSubsystemForm.projectId)
    .maybeSingle();

  if (!projectRecord) {
    return {
      ...previousState,
      status: "error",
      message: "所选项目不存在。",
    };
  }

  if (parsedSubsystemForm.subsystemId) {
    const { error } = await supabaseClient
      .from("subsystems")
      .update({
        project_id: parsedSubsystemForm.projectId,
        name: parsedSubsystemForm.name,
        description: parsedSubsystemForm.description,
        sort_order: parsedSubsystemForm.sortOrder,
      })
      .eq("id", parsedSubsystemForm.subsystemId);

    if (error) {
      return {
        ...previousState,
        status: "error",
        message: error.message,
      };
    }

    revalidateAdminViews(parsedSubsystemForm.projectId);

    return {
      status: "success",
      message: "子系统已更新。",
    };
  }

  const { error } = await supabaseClient.from("subsystems").insert({
    project_id: parsedSubsystemForm.projectId,
    name: parsedSubsystemForm.name,
    description: parsedSubsystemForm.description,
    sort_order: parsedSubsystemForm.sortOrder,
  });

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: error.message,
    };
  }

  revalidateAdminViews(parsedSubsystemForm.projectId);

  return {
    status: "success",
    message: "子系统已创建。",
  };
}

export async function upsertMilestoneAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedMilestoneForm;

  try {
    parsedMilestoneForm = parseMilestoneFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data: projectRecord } = await supabaseClient
    .from("projects")
    .select("id")
    .eq("id", parsedMilestoneForm.projectId)
    .maybeSingle();

  if (!projectRecord) {
    return {
      ...previousState,
      status: "error",
      message: "所选项目不存在。",
    };
  }

  if (parsedMilestoneForm.milestoneId) {
    const { error } = await supabaseClient
      .from("milestones")
      .update({
        project_id: parsedMilestoneForm.projectId,
        name: parsedMilestoneForm.name,
        description: parsedMilestoneForm.description,
        status: parsedMilestoneForm.status,
        due_date: parsedMilestoneForm.dueDate,
      })
      .eq("id", parsedMilestoneForm.milestoneId);

    if (error) {
      return {
        ...previousState,
        status: "error",
        message: error.message,
      };
    }

    revalidateAdminViews(parsedMilestoneForm.projectId);

    return {
      status: "success",
      message: "里程碑已更新。",
    };
  }

  const { error } = await supabaseClient.from("milestones").insert({
    project_id: parsedMilestoneForm.projectId,
    name: parsedMilestoneForm.name,
    description: parsedMilestoneForm.description,
    status: parsedMilestoneForm.status,
    due_date: parsedMilestoneForm.dueDate,
  });

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: error.message,
    };
  }

  revalidateAdminViews(parsedMilestoneForm.projectId);

  return {
    status: "success",
    message: "里程碑已创建。",
  };
}

export async function createMemberAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedCreateMemberForm;

  try {
    parsedCreateMemberForm = parseCreateMemberFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const adminSupabaseClient = getAdminSupabaseClient();
  const { data: createdUserResult, error: createUserError } =
    await adminSupabaseClient.auth.admin.createUser({
      email: parsedCreateMemberForm.email,
      password: parsedCreateMemberForm.initialPassword,
      email_confirm: true,
      user_metadata: {
        display_name: parsedCreateMemberForm.displayName,
      },
    });

  if (createUserError || !createdUserResult.user) {
    return {
      ...previousState,
      status: "error",
      message: createUserError?.message ?? "创建成员账号失败。",
    };
  }

  const supabaseClient = await getServerSupabaseClient();
  const { error: createProfileError } = await supabaseClient
    .from("user_profiles")
    .insert({
      id: createdUserResult.user.id,
      email: parsedCreateMemberForm.email,
      display_name: parsedCreateMemberForm.displayName,
      role: "member",
      is_active: true,
    });

  if (createProfileError) {
    await adminSupabaseClient.auth.admin.deleteUser(createdUserResult.user.id);

    return {
      ...previousState,
      status: "error",
      message: createProfileError.message,
    };
  }

  revalidateAdminViews();

  return {
    status: "success",
    message: "成员账号已创建。",
  };
}

export async function resetUserPasswordAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedResetPasswordForm;

  try {
    parsedResetPasswordForm = parseResetPasswordFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const adminSupabaseClient = getAdminSupabaseClient();
  const { error } = await adminSupabaseClient.auth.admin.updateUserById(
    parsedResetPasswordForm.userId,
    {
      password: parsedResetPasswordForm.newPassword,
    },
  );

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: error.message,
    };
  }

  revalidateAdminViews();

  return {
    status: "success",
    message: "密码已重置。",
  };
}

export async function toggleUserActiveAction(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const adminSessionState = await ensureAdminActionState(previousState);

  if (adminSessionState.errorState) {
    return adminSessionState.errorState;
  }

  let parsedToggleUserForm;

  try {
    parsedToggleUserForm = parseToggleUserActiveFormData(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ...previousState,
        status: "error",
        message: formatValidationMessage(error),
      };
    }

    throw error;
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data: userRecord, error: userRecordError } = await supabaseClient
    .from("user_profiles")
    .select("id, role, is_active")
    .eq("id", parsedToggleUserForm.userId)
    .maybeSingle();

  if (userRecordError || !userRecord) {
    return {
      ...previousState,
      status: "error",
      message: "未找到需要更新的成员。",
    };
  }

  if (userRecord.role === "admin") {
    return {
      ...previousState,
      status: "error",
      message: "管理员账号不能在这里被停用。",
    };
  }

  const { error } = await supabaseClient
    .from("user_profiles")
    .update({
      is_active: parsedToggleUserForm.nextIsActive,
    })
    .eq("id", parsedToggleUserForm.userId);

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: error.message,
    };
  }

  revalidateAdminViews();

  return {
    status: "success",
    message: parsedToggleUserForm.nextIsActive
      ? "成员账号已重新启用。"
      : "成员账号已停用。",
  };
}
