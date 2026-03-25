import { cache } from "react";

import { getSessionUser } from "@/lib/auth/get-session-user";
import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import { canMutateTask } from "@/lib/permissions";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildTaskFormDefaults,
  filterRelatedTaskOptions,
  type EditableTask,
  type RelatedTaskOption,
  type TaskFormDefaults,
} from "@/features/tasks/task-editor";
import type { MilestoneStatus, TaskPriority, TaskStatus } from "@/types/database";

type RawEditableTask = {
  assignee_id: string;
  blocked_reason: string;
  creator_id: string;
  description: string;
  due_at: string | null;
  group_tag: string;
  id: string;
  is_integration_task: boolean;
  milestone_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  subsystem_id: string;
  title: string;
};

type RawRelatedTask = {
  id: string;
  subsystem: Array<{
    name: string;
  }> | null;
  title: string;
};

type RawTaskRelation = {
  relation_type: "depends_on" | "integration_input" | "related_to";
  target_task_id: string;
};

export type ProjectTaskEditorResponse = {
  assignees: Array<{
    id: string;
    name: string;
  }>;
  defaults: TaskFormDefaults;
  milestones: Array<{
    id: string;
    name: string;
    status: MilestoneStatus;
  }>;
  mode: "create" | "edit";
  relatedTasks: RelatedTaskOption[];
  subsystems: Array<{
    id: string;
    name: string;
  }>;
};

function relationFirst<T>(relation: T[] | null | undefined) {
  return relation?.[0] ?? null;
}

export const getProjectTaskEditor = cache(
  async (
    projectId: string,
    editTaskId: string | null,
  ): Promise<ProjectTaskEditorResponse> => {
    if (!hasPublicEnvironmentConfiguration(process.env)) {
      return {
        mode: "create",
        defaults: buildTaskFormDefaults({
          projectId,
          task: null,
        }),
        assignees: [],
        milestones: [],
        relatedTasks: [],
        subsystems: [],
      };
    }

    const sessionUser = await getSessionUser();
    const supabaseClient = await getServerSupabaseClient();

    const subsystemsPromise = supabaseClient
      .from("subsystems")
      .select("id, name, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    const milestonesPromise = supabaseClient
      .from("milestones")
      .select("id, name, status, due_date")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true, nullsFirst: false });

    const assigneesPromise = supabaseClient
      .from("user_profiles")
      .select("id, display_name")
      .eq("is_active", true)
      .order("display_name", { ascending: true });

    const relatedTasksPromise = supabaseClient
      .from("tasks")
      .select("id, title, subsystem:subsystems(name)")
      .eq("project_id", projectId)
      .order("due_at", { ascending: true, nullsFirst: false });

    const editableTaskPromise = editTaskId
      ? supabaseClient
          .from("tasks")
          .select(
            "id, title, description, subsystem_id, milestone_id, assignee_id, creator_id, status, priority, group_tag, is_integration_task, blocked_reason, due_at",
          )
          .eq("id", editTaskId)
          .eq("project_id", projectId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const editableRelationPromise = editTaskId
      ? supabaseClient
          .from("task_relations")
          .select("target_task_id, relation_type")
          .eq("source_task_id", editTaskId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const [
      subsystemsResult,
      milestonesResult,
      assigneesResult,
      relatedTasksResult,
      editableTaskResult,
      editableRelationResult,
    ] = await Promise.all([
      subsystemsPromise,
      milestonesPromise,
      assigneesPromise,
      relatedTasksPromise,
      editableTaskPromise,
      editableRelationPromise,
    ]);

    if (subsystemsResult.error) {
      throw new Error(
        `Failed to load project subsystems: ${subsystemsResult.error.message}`,
      );
    }

    if (milestonesResult.error) {
      throw new Error(
        `Failed to load project milestones: ${milestonesResult.error.message}`,
      );
    }

    if (assigneesResult.error) {
      throw new Error(
        `Failed to load assignees: ${assigneesResult.error.message}`,
      );
    }

    if (relatedTasksResult.error) {
      throw new Error(
        `Failed to load related tasks: ${relatedTasksResult.error.message}`,
      );
    }

    if (editableTaskResult.error) {
      throw new Error(
        `Failed to load editable task: ${editableTaskResult.error.message}`,
      );
    }

    if (editableRelationResult.error) {
      throw new Error(
        `Failed to load task relation: ${editableRelationResult.error.message}`,
      );
    }

    const editableTaskRecord = editableTaskResult.data as RawEditableTask | null;
    const editableRelationRecord =
      editableRelationResult.data as RawTaskRelation | null;

    const editableTask =
      sessionUser &&
      editableTaskRecord &&
      canMutateTask({
        actorId: sessionUser.id,
        actorRole: sessionUser.role,
        assigneeId: editableTaskRecord.assignee_id,
        creatorId: editableTaskRecord.creator_id,
      })
        ? ({
            id: editableTaskRecord.id,
            title: editableTaskRecord.title,
            description: editableTaskRecord.description,
            subsystemId: editableTaskRecord.subsystem_id,
            milestoneId: editableTaskRecord.milestone_id,
            assigneeId: editableTaskRecord.assignee_id,
            status: editableTaskRecord.status,
            priority: editableTaskRecord.priority,
            groupTag: editableTaskRecord.group_tag,
            isIntegrationTask: editableTaskRecord.is_integration_task,
            blockedReason: editableTaskRecord.blocked_reason,
            dueAt: editableTaskRecord.due_at,
            relation: editableRelationRecord
              ? {
                  relatedTaskId: editableRelationRecord.target_task_id,
                  relationType: editableRelationRecord.relation_type,
                }
              : null,
          } satisfies EditableTask)
        : null;

    const relatedTasks = ((relatedTasksResult.data ?? []) as unknown as RawRelatedTask[])
      .map((relatedTask) => ({
        id: relatedTask.id,
        title: relatedTask.title,
        subsystemName: relationFirst(relatedTask.subsystem)?.name ?? "未分配子系统",
      }))
      .toSorted((firstTask, secondTask) =>
        firstTask.title.localeCompare(secondTask.title, "zh-CN"),
      );

    const filteredRelatedTasks = filterRelatedTaskOptions(
      editableTask?.id ?? "",
      relatedTasks,
    );

    return {
      mode: editableTask ? "edit" : "create",
      defaults: buildTaskFormDefaults({
        projectId,
        task: editableTask,
      }),
      assignees: (assigneesResult.data ?? []).map((assignee) => ({
        id: assignee.id,
        name: assignee.display_name,
      })),
      milestones: (milestonesResult.data ?? []).map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        status: milestone.status,
      })),
      subsystems: (subsystemsResult.data ?? []).map((subsystem) => ({
        id: subsystem.id,
        name: subsystem.name,
      })),
      relatedTasks: filteredRelatedTasks,
    };
  },
);
