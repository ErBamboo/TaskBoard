import { cache } from "react";

import {
  buildMilestoneFormDefaults,
  buildProjectFormDefaults,
  buildSubsystemFormDefaults,
  resolveAdminScopeProjectId,
} from "@/features/admin/admin-editor";
import { hasPublicEnvironmentConfiguration } from "@/lib/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { MilestoneStatus, ProjectStatus, UserRole } from "@/types/database";

type RawAdminUser = {
  display_name: string;
  email: string;
  id: string;
  is_active: boolean;
  role: UserRole;
};

type RawAdminProject = {
  description: string;
  id: string;
  name: string;
  start_date: string | null;
  status: ProjectStatus;
  target_date: string | null;
};

type RawAdminSubsystem = {
  description: string;
  id: string;
  name: string;
  project_id: string;
  sort_order: number;
};

type RawAdminMilestone = {
  description: string;
  due_date: string | null;
  id: string;
  name: string;
  project_id: string;
  status: MilestoneStatus;
};

export type AdminConsoleResponse = {
  milestoneEditor: {
    defaults: ReturnType<typeof buildMilestoneFormDefaults>;
    mode: "create" | "edit";
  };
  milestones: Array<{
    description: string;
    dueDate: string | null;
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    status: MilestoneStatus;
  }>;
  projectEditor: {
    defaults: ReturnType<typeof buildProjectFormDefaults>;
    mode: "create" | "edit";
  };
  projects: Array<{
    description: string;
    id: string;
    milestoneCount: number;
    name: string;
    startDate: string | null;
    status: ProjectStatus;
    subsystemCount: number;
    targetDate: string | null;
  }>;
  scopeProjectId: string | null;
  scopeProjectName: string | null;
  subsystemEditor: {
    defaults: ReturnType<typeof buildSubsystemFormDefaults>;
    mode: "create" | "edit";
  };
  subsystems: Array<{
    description: string;
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    sortOrder: number;
  }>;
  summary: {
    activeMemberCount: number;
    activeProjectCount: number;
    milestoneCount: number;
    subsystemCount: number;
  };
  users: Array<{
    displayName: string;
    email: string;
    id: string;
    isActive: boolean;
    role: UserRole;
  }>;
};

function sanitizeSearchParamValue(
  searchParamValue: string | string[] | undefined,
) {
  return typeof searchParamValue === "string" ? searchParamValue : null;
}

export const getAdminConsole = cache(
  async (
    searchParams:
      | Record<string, string | string[] | undefined>
      | undefined,
  ): Promise<AdminConsoleResponse> => {
    if (!hasPublicEnvironmentConfiguration(process.env)) {
      return {
        milestoneEditor: {
          mode: "create",
          defaults: buildMilestoneFormDefaults({
            scopeProjectId: null,
            milestone: null,
          }),
        },
        milestones: [],
        projectEditor: {
          mode: "create",
          defaults: buildProjectFormDefaults({
            project: null,
          }),
        },
        projects: [],
        scopeProjectId: null,
        scopeProjectName: null,
        subsystemEditor: {
          mode: "create",
          defaults: buildSubsystemFormDefaults({
            scopeProjectId: null,
            subsystem: null,
          }),
        },
        subsystems: [],
        summary: {
          activeMemberCount: 0,
          activeProjectCount: 0,
          milestoneCount: 0,
          subsystemCount: 0,
        },
        users: [],
      };
    }

    const supabaseClient = await getServerSupabaseClient();

    const usersPromise = supabaseClient
      .from("user_profiles")
      .select("id, email, display_name, role, is_active")
      .order("role", { ascending: false })
      .order("display_name", { ascending: true });

    const projectsPromise = supabaseClient
      .from("projects")
      .select("id, name, description, status, start_date, target_date")
      .order("created_at", { ascending: true });

    const subsystemsPromise = supabaseClient
      .from("subsystems")
      .select("id, project_id, name, description, sort_order")
      .order("sort_order", { ascending: true });

    const milestonesPromise = supabaseClient
      .from("milestones")
      .select("id, project_id, name, description, status, due_date")
      .order("due_date", { ascending: true, nullsFirst: false });

    const [usersResult, projectsResult, subsystemsResult, milestonesResult] =
      await Promise.all([
        usersPromise,
        projectsPromise,
        subsystemsPromise,
        milestonesPromise,
      ]);

    if (usersResult.error) {
      console.error("[getAdminConsole] users query failed", {
        code: usersResult.error.code,
        details: usersResult.error.details,
        hint: usersResult.error.hint,
        message: usersResult.error.message,
      });
      throw new Error(`Failed to load admin users: ${usersResult.error.message}`);
    }

    if (projectsResult.error) {
      console.error("[getAdminConsole] projects query failed", {
        code: projectsResult.error.code,
        details: projectsResult.error.details,
        hint: projectsResult.error.hint,
        message: projectsResult.error.message,
      });
      throw new Error(
        `Failed to load admin projects: ${projectsResult.error.message}`,
      );
    }

    if (subsystemsResult.error) {
      console.error("[getAdminConsole] subsystems query failed", {
        code: subsystemsResult.error.code,
        details: subsystemsResult.error.details,
        hint: subsystemsResult.error.hint,
        message: subsystemsResult.error.message,
      });
      throw new Error(
        `Failed to load admin subsystems: ${subsystemsResult.error.message}`,
      );
    }

    if (milestonesResult.error) {
      console.error("[getAdminConsole] milestones query failed", {
        code: milestonesResult.error.code,
        details: milestonesResult.error.details,
        hint: milestonesResult.error.hint,
        message: milestonesResult.error.message,
      });
      throw new Error(
        `Failed to load admin milestones: ${milestonesResult.error.message}`,
      );
    }

    const users = ((usersResult.data ?? []) as RawAdminUser[]).map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      isActive: user.is_active,
    }));

    const projects = ((projectsResult.data ?? []) as RawAdminProject[]).map(
      (project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        targetDate: project.target_date,
        subsystemCount: 0,
        milestoneCount: 0,
      }),
    );

    const projectNameMap = new Map(
      projects.map((project) => [project.id, project.name]),
    );

    const subsystems = ((subsystemsResult.data ?? []) as RawAdminSubsystem[]).map(
      (subsystem) => ({
        id: subsystem.id,
        projectId: subsystem.project_id,
        projectName: projectNameMap.get(subsystem.project_id) ?? "未知项目",
        name: subsystem.name,
        description: subsystem.description,
        sortOrder: subsystem.sort_order,
      }),
    );

    const milestones = ((milestonesResult.data ?? []) as RawAdminMilestone[]).map(
      (milestone) => ({
        id: milestone.id,
        projectId: milestone.project_id,
        projectName: projectNameMap.get(milestone.project_id) ?? "未知项目",
        name: milestone.name,
        description: milestone.description,
        status: milestone.status,
        dueDate: milestone.due_date,
      }),
    );

    const projectIndexMap = new Map(
      projects.map((project, index) => [project.id, index]),
    );

    for (const subsystem of subsystems) {
      const projectIndex = projectIndexMap.get(subsystem.projectId);

      if (projectIndex !== undefined) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          subsystemCount: projects[projectIndex].subsystemCount + 1,
        };
      }
    }

    for (const milestone of milestones) {
      const projectIndex = projectIndexMap.get(milestone.projectId);

      if (projectIndex !== undefined) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          milestoneCount: projects[projectIndex].milestoneCount + 1,
        };
      }
    }

    const requestedScopeProjectId = sanitizeSearchParamValue(
      searchParams?.scopeProjectId,
    );
    const requestedEditProjectId = sanitizeSearchParamValue(
      searchParams?.editProjectId,
    );
    const requestedEditSubsystemId = sanitizeSearchParamValue(
      searchParams?.editSubsystemId,
    );
    const requestedEditMilestoneId = sanitizeSearchParamValue(
      searchParams?.editMilestoneId,
    );

    const editableProject =
      projects.find((project) => project.id === requestedEditProjectId) ?? null;
    const editableSubsystem =
      subsystems.find(
        (subsystem) => subsystem.id === requestedEditSubsystemId,
      ) ?? null;
    const editableMilestone =
      milestones.find(
        (milestone) => milestone.id === requestedEditMilestoneId,
      ) ?? null;

    const scopeProjectId = resolveAdminScopeProjectId(
      projects.map((project) => ({
        id: project.id,
        name: project.name,
      })),
      editableSubsystem?.projectId ??
        editableMilestone?.projectId ??
        requestedScopeProjectId,
    );

    return {
      summary: {
        activeMemberCount: users.filter(
          (user) => user.role === "member" && user.isActive,
        ).length,
        activeProjectCount: projects.filter(
          (project) => project.status === "active",
        ).length,
        subsystemCount: subsystems.length,
        milestoneCount: milestones.length,
      },
      users,
      projects,
      subsystems: scopeProjectId
        ? subsystems.filter((subsystem) => subsystem.projectId === scopeProjectId)
        : [],
      milestones: scopeProjectId
        ? milestones.filter((milestone) => milestone.projectId === scopeProjectId)
        : [],
      scopeProjectId,
      scopeProjectName:
        projects.find((project) => project.id === scopeProjectId)?.name ?? null,
      projectEditor: {
        mode: editableProject ? "edit" : "create",
        defaults: buildProjectFormDefaults({
          project: editableProject,
        }),
      },
      subsystemEditor: {
        mode: editableSubsystem ? "edit" : "create",
        defaults: buildSubsystemFormDefaults({
          scopeProjectId,
          subsystem: editableSubsystem,
        }),
      },
      milestoneEditor: {
        mode: editableMilestone ? "edit" : "create",
        defaults: buildMilestoneFormDefaults({
          scopeProjectId,
          milestone: editableMilestone,
        }),
      },
    };
  },
);
