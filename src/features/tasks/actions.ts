"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { canManageProjects, canMutateTask } from "@/lib/permissions";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import {
  initialTaskActionState,
  parseTaskFormData,
  parseTaskStatusFormData,
  type TaskActionState,
  type TaskFormValues,
  type TaskStatusFormValues,
} from "@/features/tasks/task-form-schema";

function completedAtForStatus(status: TaskFormValues["status"]) {
  return status === "done" ? new Date().toISOString() : null;
}

function revalidateTaskViews(projectId: string) {
  revalidatePath("/my-tasks");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

function formatValidationMessage(error: ZodError) {
  const messages = [...new Set(error.issues.map((issue) => issue.message))];

  if (messages.length === 0) {
    return "表单校验失败，请检查输入内容。";
  }

  return messages.join(" ");
}

async function createTaskRelationAction(
  sourceTaskId: string,
  relatedTaskId: string | null,
  relationType: TaskFormValues["relationType"],
) {
  if (!relatedTaskId || !relationType) {
    return null;
  }

  const supabaseClient = await getServerSupabaseClient();
  const { error } = await supabaseClient.from("task_relations").upsert(
    {
      source_task_id: sourceTaskId,
      target_task_id: relatedTaskId,
      relation_type: relationType,
    },
    {
      onConflict: "source_task_id,target_task_id,relation_type",
    },
  );

  return error?.message ?? null;
}

export async function upsertTaskAction(
  previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return {
      ...previousState,
      status: "error",
      message: "未登录，无法提交任务。",
    };
  }

  let parsedTaskForm: TaskFormValues;

  try {
    parsedTaskForm = parseTaskFormData(formData);
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

  const { data: subsystemRecord } = await supabaseClient
    .from("subsystems")
    .select("id, project_id")
    .eq("id", parsedTaskForm.subsystemId)
    .maybeSingle();

  if (!subsystemRecord || subsystemRecord.project_id !== parsedTaskForm.projectId) {
    return {
      ...previousState,
      status: "error",
      message: "子系统与项目不匹配。",
    };
  }

  if (parsedTaskForm.milestoneId) {
    const { data: milestoneRecord } = await supabaseClient
      .from("milestones")
      .select("id, project_id")
      .eq("id", parsedTaskForm.milestoneId)
      .maybeSingle();

    if (!milestoneRecord || milestoneRecord.project_id !== parsedTaskForm.projectId) {
      return {
        ...previousState,
        status: "error",
        message: "里程碑与项目不匹配。",
      };
    }
  }

  if (parsedTaskForm.taskId) {
    const { data: existingTask, error: existingTaskError } = await supabaseClient
      .from("tasks")
      .select("id, project_id, assignee_id, creator_id")
      .eq("id", parsedTaskForm.taskId)
      .maybeSingle();

    if (existingTaskError || !existingTask) {
      return {
        ...previousState,
        status: "error",
        message: "未找到需要编辑的任务。",
      };
    }

    const canEditTask = canMutateTask({
      actorId: sessionUser.id,
      actorRole: sessionUser.role,
      assigneeId: existingTask.assignee_id,
      creatorId: existingTask.creator_id,
    });

    if (!canEditTask) {
      return {
        ...previousState,
        status: "error",
        message: "你没有权限编辑这个任务。",
      };
    }

    const { error: updateTaskError } = await supabaseClient
      .from("tasks")
      .update({
        title: parsedTaskForm.title,
        description: parsedTaskForm.description,
        subsystem_id: parsedTaskForm.subsystemId,
        milestone_id: parsedTaskForm.milestoneId,
        assignee_id: parsedTaskForm.assigneeId,
        status: parsedTaskForm.status,
        priority: parsedTaskForm.priority,
        group_tag: parsedTaskForm.groupTag,
        is_integration_task: parsedTaskForm.isIntegrationTask,
        blocked_reason: parsedTaskForm.blockedReason,
        due_at: parsedTaskForm.dueAt,
        completed_at: completedAtForStatus(parsedTaskForm.status),
      })
      .eq("id", parsedTaskForm.taskId);

    if (updateTaskError) {
      return {
        ...previousState,
        status: "error",
        message: updateTaskError.message,
      };
    }

    const relationErrorMessage = await createTaskRelationAction(
      parsedTaskForm.taskId,
      parsedTaskForm.relatedTaskId,
      parsedTaskForm.relationType,
    );

    revalidateTaskViews(existingTask.project_id);

    return {
      status: "success",
      message: relationErrorMessage
        ? `任务已更新，但关联任务写入失败：${relationErrorMessage}`
        : "任务已更新。",
    };
  }

  const { data: createdTask, error: createTaskError } = await supabaseClient
    .from("tasks")
    .insert({
      project_id: parsedTaskForm.projectId,
      subsystem_id: parsedTaskForm.subsystemId,
      milestone_id: parsedTaskForm.milestoneId,
      assignee_id: parsedTaskForm.assigneeId,
      creator_id: sessionUser.id,
      title: parsedTaskForm.title,
      description: parsedTaskForm.description,
      status: parsedTaskForm.status,
      priority: parsedTaskForm.priority,
      group_tag: parsedTaskForm.groupTag,
      is_integration_task: parsedTaskForm.isIntegrationTask,
      blocked_reason: parsedTaskForm.blockedReason,
      due_at: parsedTaskForm.dueAt,
      completed_at: completedAtForStatus(parsedTaskForm.status),
    })
    .select("id")
    .single();

  if (createTaskError || !createdTask) {
    return {
      ...previousState,
      status: "error",
      message: createTaskError?.message ?? "创建任务失败。",
    };
  }

  const relationErrorMessage = await createTaskRelationAction(
    createdTask.id,
    parsedTaskForm.relatedTaskId,
    parsedTaskForm.relationType,
  );

  revalidateTaskViews(parsedTaskForm.projectId);

  return {
    status: "success",
    message: relationErrorMessage
      ? `任务已创建，但关联任务写入失败：${relationErrorMessage}`
      : "任务已创建。",
  };
}

export async function updateTaskStatusAction(
  previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return {
      ...previousState,
      status: "error",
      message: "未登录，无法更新任务状态。",
    };
  }

  let parsedTaskStatusForm: TaskStatusFormValues;

  try {
    parsedTaskStatusForm = parseTaskStatusFormData(formData);
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
  const { data: existingTask, error: existingTaskError } = await supabaseClient
    .from("tasks")
    .select("id, project_id, assignee_id")
    .eq("id", parsedTaskStatusForm.taskId)
    .maybeSingle();

  if (existingTaskError || !existingTask) {
    return {
      ...previousState,
      status: "error",
      message: "未找到需要更新状态的任务。",
    };
  }

  const canUpdateStatus =
    canManageProjects(sessionUser.role) ||
    sessionUser.id === existingTask.assignee_id;

  if (!canUpdateStatus) {
    return {
      ...previousState,
      status: "error",
      message: "你没有权限更新这个任务状态。",
    };
  }

  const { error: updateStatusError } = await supabaseClient
    .from("tasks")
    .update({
      status: parsedTaskStatusForm.status,
      blocked_reason: parsedTaskStatusForm.blockedReason,
      completed_at:
        parsedTaskStatusForm.status === "done"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", parsedTaskStatusForm.taskId);

  if (updateStatusError) {
    return {
      ...previousState,
      status: "error",
      message: updateStatusError.message,
    };
  }

  revalidateTaskViews(existingTask.project_id);

  return {
    status: "success",
    message: "任务状态已更新。",
  };
}

export { initialTaskActionState };
