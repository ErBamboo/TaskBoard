export type UserRole = "admin" | "member";

type TaskMutationContext = {
  actorId: string;
  actorRole: UserRole;
  assigneeId: string;
  creatorId: string;
};

export function canManageProjects(userRole: UserRole) {
  return userRole === "admin";
}

export function canMutateTask({
  actorId,
  actorRole,
  assigneeId,
  creatorId,
}: TaskMutationContext) {
  if (actorRole === "admin") {
    return true;
  }

  return actorId === creatorId || actorId === assigneeId;
}
