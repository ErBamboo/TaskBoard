import type {
  TaskPriority,
  TaskRelationType,
  TaskStatus,
} from "@/types/database";

export type EditableTaskRelation = {
  relatedTaskId: string;
  relationType: TaskRelationType;
};

export type EditableTask = {
  assigneeId: string;
  blockedReason: string;
  description: string;
  dueAt: string | null;
  groupTag: string;
  id: string;
  isIntegrationTask: boolean;
  milestoneId: string | null;
  priority: TaskPriority;
  relation: EditableTaskRelation | null;
  status: TaskStatus;
  subsystemId: string;
  title: string;
};

export type TaskFormDefaults = {
  assigneeId: string;
  blockedReason: string;
  description: string;
  dueAt: string;
  groupTag: string;
  isIntegrationTask: boolean;
  milestoneId: string;
  priority: TaskPriority;
  projectId: string;
  relatedTaskId: string;
  relationType: TaskRelationType | "";
  status: TaskStatus;
  subsystemId: string;
  taskId: string;
  title: string;
};

export type RelatedTaskOption = {
  id: string;
  subsystemName: string;
  title: string;
};

function toDateTimeLocalValue(isoString: string | null) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function buildTaskFormDefaults({
  projectId,
  task,
}: {
  projectId: string;
  task: EditableTask | null;
}): TaskFormDefaults {
  if (!task) {
    return {
      taskId: "",
      projectId,
      title: "",
      description: "",
      subsystemId: "",
      milestoneId: "",
      assigneeId: "",
      status: "todo",
      priority: "medium",
      groupTag: "",
      isIntegrationTask: false,
      blockedReason: "",
      dueAt: "",
      relatedTaskId: "",
      relationType: "",
    };
  }

  return {
    taskId: task.id,
    projectId,
    title: task.title,
    description: task.description,
    subsystemId: task.subsystemId,
    milestoneId: task.milestoneId ?? "",
    assigneeId: task.assigneeId,
    status: task.status,
    priority: task.priority,
    groupTag: task.groupTag,
    isIntegrationTask: task.isIntegrationTask,
    blockedReason: task.blockedReason,
    dueAt: toDateTimeLocalValue(task.dueAt),
    relatedTaskId: task.relation?.relatedTaskId ?? "",
    relationType: task.relation?.relationType ?? "",
  };
}

export function filterRelatedTaskOptions(
  currentTaskId: string,
  relatedTaskOptions: readonly RelatedTaskOption[],
) {
  if (!currentTaskId) {
    return [...relatedTaskOptions];
  }

  return relatedTaskOptions.filter(
    (relatedTaskOption) => relatedTaskOption.id !== currentTaskId,
  );
}
