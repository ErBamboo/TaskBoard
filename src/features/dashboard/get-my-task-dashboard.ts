import type {
  TaskPriority,
  TaskStatus,
} from "@/types/database";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type DashboardTask = {
  blockedReason: string;
  dueAt: string | null;
  id: string;
  isIntegrationTask: boolean;
  milestoneName: string | null;
  priority: TaskPriority;
  projectId?: string;
  projectName: string;
  status: TaskStatus;
  subsystemName: string;
  title: string;
};

export type DashboardTaskGroups = Record<TaskStatus, DashboardTask[]>;

type DashboardSummary = {
  blockedTasks: DashboardTask[];
  groupedTasks: DashboardTaskGroups;
  milestoneNames: string[];
  upcomingTasks: DashboardTask[];
  userDisplayName: string;
};

type RawDashboardTask = {
  blocked_reason: string;
  due_at: string | null;
  id: string;
  is_integration_task: boolean;
  milestone: Array<{ name: string }> | null;
  priority: TaskPriority;
  project: Array<{ id: string; name: string }> | null;
  status: TaskStatus;
  subsystem: Array<{ name: string }> | null;
  title: string;
};

const emptyDashboardTaskGroups: DashboardTaskGroups = {
  todo: [],
  in_progress: [],
  blocked: [],
  done: [],
};

function extractRelationName(
  relation: Array<{ name: string }> | null | undefined,
  fallbackName: string,
) {
  return relation?.[0]?.name ?? fallbackName;
}

export function groupTasksByStatus(tasks: DashboardTask[]) {
  return tasks.reduce<DashboardTaskGroups>((groupedTasks, task) => {
    groupedTasks[task.status].push(task);
    return groupedTasks;
  }, structuredClone(emptyDashboardTaskGroups));
}

function uniqueMilestoneNames(tasks: DashboardTask[]) {
  return [...new Set(tasks.flatMap((task) => (task.milestoneName ? [task.milestoneName] : [])))];
}

export async function getMyTaskDashboard(): Promise<DashboardSummary | null> {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return null;
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data, error } = await supabaseClient
    .from("tasks")
    .select(
      `
        id,
        title,
        status,
        priority,
        due_at,
        blocked_reason,
        is_integration_task,
        project:projects(id, name),
        subsystem:subsystems(name),
        milestone:milestones(name)
      `,
    )
    .eq("assignee_id", sessionUser.id)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load dashboard tasks: ${error.message}`);
  }

  const dashboardTasks = ((data ?? []) as unknown as RawDashboardTask[]).map(
    (rawDashboardTask): DashboardTask => ({
      id: rawDashboardTask.id,
      title: rawDashboardTask.title,
      status: rawDashboardTask.status,
      priority: rawDashboardTask.priority,
      dueAt: rawDashboardTask.due_at,
      blockedReason: rawDashboardTask.blocked_reason,
      isIntegrationTask: rawDashboardTask.is_integration_task,
      projectId: rawDashboardTask.project?.[0]?.id,
      projectName: extractRelationName(rawDashboardTask.project, "未知项目"),
      subsystemName: extractRelationName(
        rawDashboardTask.subsystem,
        "未分配子系统",
      ),
      milestoneName: rawDashboardTask.milestone?.[0]?.name ?? null,
    }),
  );

  return {
    userDisplayName: sessionUser.displayName,
    groupedTasks: groupTasksByStatus(dashboardTasks),
    blockedTasks: dashboardTasks.filter((dashboardTask) => dashboardTask.status === "blocked"),
    upcomingTasks: dashboardTasks.filter((dashboardTask) => dashboardTask.dueAt).slice(0, 4),
    milestoneNames: uniqueMilestoneNames(dashboardTasks),
  };
}
