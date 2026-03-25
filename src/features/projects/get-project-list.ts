import { cache } from "react";

import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import type {
  MilestoneStatus,
  ProjectStatus,
  TaskStatus,
} from "@/types/database";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ProjectCardSource = {
  description: string;
  id: string;
  milestones: Array<{
    id: string;
    status: MilestoneStatus;
  }>;
  name: string;
  status: ProjectStatus;
  targetDate: string | null;
  tasks: Array<{
    id: string;
    isIntegrationTask: boolean;
    status: TaskStatus;
  }>;
};

export type ProjectCardSummary = {
  blockedTaskCount: number;
  description: string;
  id: string;
  integrationTaskCount: number;
  milestoneCount: number;
  name: string;
  openTaskCount: number;
  status: ProjectStatus;
  targetDate: string | null;
};

type RawProjectListRow = {
  description: string;
  id: string;
  milestones: Array<{
    id: string;
    status: MilestoneStatus;
  }> | null;
  name: string;
  status: ProjectStatus;
  target_date: string | null;
  tasks: Array<{
    id: string;
    is_integration_task: boolean;
    status: TaskStatus;
  }> | null;
};

function projectStatusOrder(projectStatus: ProjectStatus) {
  switch (projectStatus) {
    case "active":
      return 0;
    case "planning":
      return 1;
    case "archived":
      return 2;
    default:
      return 3;
  }
}

export function buildProjectCardSummaries(
  projectCardSources: ProjectCardSource[],
) {
  return projectCardSources
    .map<ProjectCardSummary>((projectCardSource) => {
      const openTaskCount = projectCardSource.tasks.filter(
        (task) => task.status !== "done",
      ).length;

      return {
        id: projectCardSource.id,
        name: projectCardSource.name,
        description: projectCardSource.description,
        status: projectCardSource.status,
        targetDate: projectCardSource.targetDate,
        milestoneCount: projectCardSource.milestones.length,
        blockedTaskCount: projectCardSource.tasks.filter(
          (task) => task.status === "blocked",
        ).length,
        integrationTaskCount: projectCardSource.tasks.filter(
          (task) => task.isIntegrationTask,
        ).length,
        openTaskCount,
      };
    })
    .toSorted((firstProject, secondProject) => {
      const statusOrderDifference =
        projectStatusOrder(firstProject.status) -
        projectStatusOrder(secondProject.status);

      if (statusOrderDifference !== 0) {
        return statusOrderDifference;
      }

      if (!firstProject.targetDate && !secondProject.targetDate) {
        return firstProject.name.localeCompare(secondProject.name, "zh-CN");
      }

      if (!firstProject.targetDate) {
        return 1;
      }

      if (!secondProject.targetDate) {
        return -1;
      }

      return (
        new Date(firstProject.targetDate).getTime() -
        new Date(secondProject.targetDate).getTime()
      );
    });
}

export const getProjectList = cache(async () => {
  if (!hasPublicEnvironmentConfiguration(process.env)) {
    return [];
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select(
      `
        id,
        name,
        description,
        status,
        target_date,
        milestones(id, status),
        tasks(id, status, is_integration_task)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  const projectCardSources = ((data ?? []) as unknown as RawProjectListRow[]).map(
    (rawProjectListRow): ProjectCardSource => ({
      id: rawProjectListRow.id,
      name: rawProjectListRow.name,
      description: rawProjectListRow.description,
      status: rawProjectListRow.status,
      targetDate: rawProjectListRow.target_date,
      milestones: rawProjectListRow.milestones ?? [],
      tasks: (rawProjectListRow.tasks ?? []).map((task) => ({
        id: task.id,
        status: task.status,
        isIntegrationTask: task.is_integration_task,
      })),
    }),
  );

  return buildProjectCardSummaries(projectCardSources);
});
