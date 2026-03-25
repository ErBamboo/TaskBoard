import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MemberImportStep } from "@/components/setup/member-import-step";
import { ProjectTemplateStep } from "@/components/setup/project-template-step";
import type { SetupMemberInput, SetupProjectInput } from "@/features/setup/setup-schema";

type ProjectDraft = SetupProjectInput & {
  clientId: string;
};

type MemberDraft = SetupMemberInput & {
  clientId: string;
};

function ProjectTemplateHarness() {
  const [projects, setProjects] = useState<ProjectDraft[]>([
    {
      clientId: "project-1",
      description: "",
      name: "",
    },
  ]);

  return (
    <ProjectTemplateStep
      addProject={() => undefined}
      projects={projects}
      removeProject={() => undefined}
      updateProject={(index, field, value) => {
        setProjects((currentProjects) =>
          currentProjects.map((project, projectIndex) =>
            projectIndex === index
              ? {
                  ...project,
                  [field]: value,
                }
              : project,
          ),
        );
      }}
    />
  );
}

function MemberImportHarness() {
  const [members, setMembers] = useState<MemberDraft[]>([
    {
      clientId: "member-1",
      displayName: "",
      email: "",
    },
  ]);

  return (
    <MemberImportStep
      addMember={() => undefined}
      members={members}
      removeMember={() => undefined}
      updateMember={(index, field, value) => {
        setMembers((currentMembers) =>
          currentMembers.map((member, memberIndex) =>
            memberIndex === index
              ? {
                  ...member,
                  [field]: value,
                }
              : member,
          ),
        );
      }}
    />
  );
}

test("keeps the project name input focused while typing", async () => {
  const user = userEvent.setup();

  render(<ProjectTemplateHarness />);

  const projectNameInput = screen.getByLabelText("项目名称");

  await user.click(projectNameInput);
  await user.type(projectNameInput, "H");

  const updatedProjectNameInput = screen.getByLabelText("项目名称");

  expect(updatedProjectNameInput).toBe(projectNameInput);
  expect(updatedProjectNameInput).toHaveFocus();
  expect(updatedProjectNameInput).toHaveValue("H");
});

test("keeps the member email input focused while typing", async () => {
  const user = userEvent.setup();

  render(<MemberImportHarness />);

  const memberEmailInput = screen.getByLabelText("邮箱");

  await user.click(memberEmailInput);
  await user.type(memberEmailInput, "a");

  const updatedMemberEmailInput = screen.getByLabelText("邮箱");

  expect(updatedMemberEmailInput).toBe(memberEmailInput);
  expect(updatedMemberEmailInput).toHaveFocus();
  expect(updatedMemberEmailInput).toHaveValue("a");
});
