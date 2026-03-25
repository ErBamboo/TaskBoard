import type { MilestoneStatus, ProjectStatus } from "@/types/database";

export type AdminProjectOption = {
  id: string;
  name: string;
};

export type EditableProject = {
  description: string;
  id: string;
  name: string;
  startDate: string | null;
  status: ProjectStatus;
  targetDate: string | null;
};

export type EditableSubsystem = {
  description: string;
  id: string;
  name: string;
  projectId: string;
  sortOrder: number;
};

export type EditableMilestone = {
  description: string;
  dueDate: string | null;
  id: string;
  name: string;
  projectId: string;
  status: MilestoneStatus;
};

export type ProjectFormDefaults = {
  description: string;
  name: string;
  projectId: string;
  startDate: string;
  status: ProjectStatus;
  targetDate: string;
};

export type SubsystemFormDefaults = {
  description: string;
  name: string;
  projectId: string;
  sortOrder: number;
  subsystemId: string;
};

export type MilestoneFormDefaults = {
  description: string;
  dueDate: string;
  milestoneId: string;
  name: string;
  projectId: string;
  status: MilestoneStatus;
};

function toDateInputValue(dateString: string | null) {
  return dateString ?? "";
}

export function resolveAdminScopeProjectId(
  projects: readonly AdminProjectOption[],
  requestedProjectId: string | null,
) {
  if (
    requestedProjectId &&
    projects.some((project) => project.id === requestedProjectId)
  ) {
    return requestedProjectId;
  }

  return projects[0]?.id ?? null;
}

export function buildProjectFormDefaults({
  project,
}: {
  project: EditableProject | null;
}): ProjectFormDefaults {
  if (!project) {
    return {
      projectId: "",
      name: "",
      description: "",
      status: "planning",
      startDate: "",
      targetDate: "",
    };
  }

  return {
    projectId: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: toDateInputValue(project.startDate),
    targetDate: toDateInputValue(project.targetDate),
  };
}

export function buildSubsystemFormDefaults({
  scopeProjectId,
  subsystem,
}: {
  scopeProjectId: string | null;
  subsystem: EditableSubsystem | null;
}): SubsystemFormDefaults {
  if (!subsystem) {
    return {
      subsystemId: "",
      projectId: scopeProjectId ?? "",
      name: "",
      description: "",
      sortOrder: 0,
    };
  }

  return {
    subsystemId: subsystem.id,
    projectId: subsystem.projectId,
    name: subsystem.name,
    description: subsystem.description,
    sortOrder: subsystem.sortOrder,
  };
}

export function buildMilestoneFormDefaults({
  scopeProjectId,
  milestone,
}: {
  scopeProjectId: string | null;
  milestone: EditableMilestone | null;
}): MilestoneFormDefaults {
  if (!milestone) {
    return {
      milestoneId: "",
      projectId: scopeProjectId ?? "",
      name: "",
      description: "",
      status: "pending",
      dueDate: "",
    };
  }

  return {
    milestoneId: milestone.id,
    projectId: milestone.projectId,
    name: milestone.name,
    description: milestone.description,
    status: milestone.status,
    dueDate: toDateInputValue(milestone.dueDate),
  };
}
