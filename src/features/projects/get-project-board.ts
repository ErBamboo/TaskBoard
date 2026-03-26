import { cache } from "react";

import { notFound } from "next/navigation";

import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { canManageProjects, canMutateTask } from "@/lib/permissions";
import type {
  MilestoneStatus,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/types/database";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { resolveRelation } from "@/lib/supabase/utils";

export type ProjectBoardTask = {
  assigneeId: string;
  assigneeName: string;
  blockedReason: string;
  canEdit: boolean;
  canUpdateStatus: boolean;
  dueAt: string | null;
  id: string;
  isIntegrationTask: boolean;
  milestoneName: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  subsystemId: string;
  subsystemName: string;
  title: string;
};

export type ProjectBoardFilters = {
  assigneeId: string;
  priority: string;
  status: string;
  subsystemId: string;
};

export type ProjectBoardTaskGroups = Record<TaskStatus, ProjectBoardTask[]>;

export type ProjectBoardResponse = {
  allTasks: ProjectBoardTask[];
  assignees: Array<{
    id: string;
    name: string;
  }>;
  blockedTaskCount: number;
  filters: ProjectBoardFilters;
  groupedTasks: ProjectBoardTaskGroups;
  integrationTaskCount: number;
  milestones: Array<{
    dueDate: string | null;
    id: string;
    name: string;
    status: MilestoneStatus;
  }>;
  project: {
    description: string;
    id: string;
    name: string;
    startDate: string | null;
    status: ProjectStatus;
    targetDate: string | null;
  };
  subsystems: Array<{
    id: string;
    name: string;
  }>;
  totalTaskCount: number;
};

type RawProjectBoardProject = {
  description: string;
  id: string;
  name: string;
  start_date: string | null;
  status: ProjectStatus;
  target_date: string | null;
};

type RawProjectBoardMilestone = {
  due_date: string | null;
  id: string;
  name: string;
  status: MilestoneStatus;
};

type RawProjectBoardTask = {
  assignee_id: string;
  assignee: {
    display_name: string;
    id: string;
  } | null;
  blocked_reason: string;
  creator_id: string;
  due_at: string | null;
  id: string;
  is_integration_task: boolean;
  milestone: {
    name: string;
  } | null;
  priority: TaskPriority;
  status: TaskStatus;
  subsystem: {
    id: string;
    name: string;
  } | null;
  title: string;
};

const emptyProjectBoardTaskGroups: ProjectBoardTaskGroups = {
  todo: [],
  in_progress: [],
  blocked: [],
  done: [],
};

function buildEmptyProjectBoardResponse(
  projectId: string,
  filters: ProjectBoardFilters,
): ProjectBoardResponse {
  return {
    allTasks: [],
    assignees: [],
    blockedTaskCount: 0,
    filters,
    groupedTasks: structuredClone(emptyProjectBoardTaskGroups),
    integrationTaskCount: 0,
    milestones: [],
    project: {
      id: projectId,
      name: "未配置 Supabase",
      description: "当前环境尚未配置 Supabase，项目数据不可用。",
      status: "planning",
      startDate: null,
      targetDate: null,
    },
    subsystems: [],
    totalTaskCount: 0,
  };
}

function sanitizeFilterValue(filterValue: string | string[] | undefined) {
  return typeof filterValue === "string" ? filterValue : "";
}

export function groupProjectBoardTasksByStatus(
  tasks: readonly ProjectBoardTask[],
) {
  return tasks.reduce<ProjectBoardTaskGroups>((groupedTasks, task) => {
    groupedTasks[task.status].push(task);
    return groupedTasks;
  }, structuredClone(emptyProjectBoardTaskGroups));
}

export function filterProjectBoardTasks(
  tasks: readonly ProjectBoardTask[],
  filters: ProjectBoardFilters,
) {
  return tasks.filter((task) => {
    if (filters.subsystemId && task.subsystemId !== filters.subsystemId) {
      return false;
    }

    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
      return false;
    }

    if (filters.status && task.status !== filters.status) {
      return false;
    }

    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    return true;
  });
}

export function normalizeProjectBoardFilters(
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>
    | undefined,
): Promise<ProjectBoardFilters> | ProjectBoardFilters {
  if (searchParams instanceof Promise) {
    return searchParams.then((resolvedSearchParams) =>
      normalizeProjectBoardFilters(resolvedSearchParams),
    ) as Promise<ProjectBoardFilters>;
  }

  return {
    subsystemId: sanitizeFilterValue(searchParams?.subsystemId),
    assigneeId: sanitizeFilterValue(searchParams?.assigneeId),
    status: sanitizeFilterValue(searchParams?.status),
    priority: sanitizeFilterValue(searchParams?.priority),
  };
}

export const getProjectBoard = cache(
  async (
    projectId: string,
    filters: ProjectBoardFilters,
  ): Promise<ProjectBoardResponse> => {
    if (!hasPublicEnvironmentConfiguration(process.env)) {
      return buildEmptyProjectBoardResponse(projectId, filters);
    }

    const sessionUser = await getSessionUser();
    const supabaseClient = await getServerSupabaseClient();

    const projectPromise = supabaseClient
      .from("projects")
      .select("id, name, description, status, start_date, target_date")
      .eq("id", projectId)
      .maybeSingle();

    const milestonesPromise = supabaseClient
      .from("milestones")
      .select("id, name, status, due_date")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true, nullsFirst: false });

    const subsystemsPromise = supabaseClient
      .from("subsystems")
      .select("id, name, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    const tasksPromise = supabaseClient
      .from("tasks")
      .select(
        `
          id,
          title,
          assignee_id,
          creator_id,
          status,
          priority,
          blocked_reason,
          is_integration_task,
          due_at,
          subsystem:subsystems(id, name),
          assignee:user_profiles!tasks_assignee_id_fkey(id, display_name),
          milestone:milestones(name)
        `,
      )
      .eq("project_id", projectId)
      .order("due_at", { ascending: true, nullsFirst: false });

    const [projectResult, milestonesResult, subsystemsResult, tasksResult] = await Promise.all([
      projectPromise,
      milestonesPromise,
      subsystemsPromise,
      tasksPromise,
    ]);

    if (projectResult.error) {
      throw new Error(`Failed to load project: ${projectResult.error.message}`);
    }

    if (!projectResult.data) {
      notFound();
    }

    if (milestonesResult.error) {
      throw new Error(
        `Failed to load project milestones: ${milestonesResult.error.message}`,
      );
    }

    if (subsystemsResult.error) {
      throw new Error(
        `Failed to load project subsystems: ${subsystemsResult.error.message}`,
      );
    }

    if (tasksResult.error) {
      throw new Error(`Failed to load project tasks: ${tasksResult.error.message}`);
    }

    const project = projectResult.data as RawProjectBoardProject;
    const milestones = ((milestonesResult.data ?? []) as RawProjectBoardMilestone[]).map(
      (rawProjectBoardMilestone) => ({
        id: rawProjectBoardMilestone.id,
        name: rawProjectBoardMilestone.name,
        status: rawProjectBoardMilestone.status,
        dueDate: rawProjectBoardMilestone.due_date,
      }),
    );

    const subsystems = (subsystemsResult.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
    }));

    const projectBoardTasks = ((tasksResult.data ?? []) as unknown as RawProjectBoardTask[]).map(
      (rawProjectBoardTask): ProjectBoardTask => {
        const subsystem = resolveRelation(rawProjectBoardTask.subsystem, {
          id: "unknown",
          name: "未分配子系统",
        });
        const assignee = resolveRelation(rawProjectBoardTask.assignee, {
          id: "unknown",
          display_name: "未指定负责人",
        });

        return {
          id: rawProjectBoardTask.id,
          title: rawProjectBoardTask.title,
          status: rawProjectBoardTask.status,
          priority: rawProjectBoardTask.priority,
          blockedReason: rawProjectBoardTask.blocked_reason,
          isIntegrationTask: rawProjectBoardTask.is_integration_task,
          dueAt: rawProjectBoardTask.due_at,
          canEdit: sessionUser
            ? canMutateTask({
                actorId: sessionUser.id,
                actorRole: sessionUser.role,
                assigneeId: rawProjectBoardTask.assignee_id,
                creatorId: rawProjectBoardTask.creator_id,
              })
            : false,
          canUpdateStatus: sessionUser
            ? canManageProjects(sessionUser.role) ||
              sessionUser.id === rawProjectBoardTask.assignee_id
            : false,
          subsystemId: subsystem.id,
          subsystemName: subsystem.name,
          assigneeId: assignee.id,
          assigneeName: assignee.display_name,
          milestoneName: rawProjectBoardTask.milestone?.name ?? null,
        };
      },
    );

    const filteredTasks = filterProjectBoardTasks(projectBoardTasks, filters);

    const assignees = [
      ...new Map(
        projectBoardTasks.map((task) => [
          task.assigneeId,
          { id: task.assigneeId, name: task.assigneeName },
        ]),
      ).values(),
    ].toSorted((firstAssignee, secondAssignee) =>
      firstAssignee.name.localeCompare(secondAssignee.name, "zh-CN"),
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        targetDate: project.target_date,
      },
      allTasks: projectBoardTasks,
      milestones,
      filters,
      assignees,
      subsystems,
      groupedTasks: groupProjectBoardTasksByStatus(filteredTasks),
      totalTaskCount: projectBoardTasks.length,
      blockedTaskCount: projectBoardTasks.filter((task) => task.status === "blocked").length,
      integrationTaskCount: projectBoardTasks.filter((task) => task.isIntegrationTask).length,
    };
  },
);
