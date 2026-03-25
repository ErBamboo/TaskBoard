import type { SetupMemberInput, SetupProjectInput } from "@/features/setup/setup-schema";

export type SetupProjectDraft = SetupProjectInput & {
  clientId: string;
};

export type SetupMemberDraft = SetupMemberInput & {
  clientId: string;
};

function createClientDraftId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createEmptyProjectDraft(): SetupProjectDraft {
  return {
    clientId: createClientDraftId("project"),
    description: "",
    name: "",
  };
}

export function createEmptyMemberDraft(): SetupMemberDraft {
  return {
    clientId: createClientDraftId("member"),
    displayName: "",
    email: "",
  };
}

export function serializeProjectDrafts(projects: readonly SetupProjectDraft[]) {
  return projects.map((project) => ({
    description: project.description,
    name: project.name,
  }));
}

export function serializeMemberDrafts(members: readonly SetupMemberDraft[]) {
  return members.map((member) => ({
    displayName: member.displayName,
    email: member.email,
  }));
}
