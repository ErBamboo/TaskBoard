import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectTemplateStep } from "@/components/setup/project-template-step";
import type { SetupProjectDraft } from "@/features/setup/setup-drafts";
import { defaultSubsystemTemplates } from "@/features/setup/setup-schema";

function ProjectTemplateSubsystemHarness() {
  const [projects] = useState<SetupProjectDraft[]>([
    {
      clientId: "project-1",
      description: "",
      name: "英雄机器人",
    },
  ]);
  const [customSubsystemName, setCustomSubsystemName] = useState("");
  const [selectedSubsystemTemplates, setSelectedSubsystemTemplates] = useState<string[]>(
    [...defaultSubsystemTemplates],
  );

  return (
    <ProjectTemplateStep
      addCustomSubsystemTemplate={() => {
        const normalizedSubsystemName = customSubsystemName.trim();

        if (
          normalizedSubsystemName.length === 0 ||
          selectedSubsystemTemplates.includes(normalizedSubsystemName)
        ) {
          return;
        }

        setSelectedSubsystemTemplates((currentSubsystemTemplates) => [
          ...currentSubsystemTemplates,
          normalizedSubsystemName,
        ]);
        setCustomSubsystemName("");
      }}
      addProject={() => undefined}
      customSubsystemName={customSubsystemName}
      projects={projects}
      removeProject={() => undefined}
      removeSubsystemTemplate={(subsystemName) =>
        setSelectedSubsystemTemplates((currentSubsystemTemplates) =>
          currentSubsystemTemplates.filter(
            (currentSubsystemTemplate) =>
              currentSubsystemTemplate !== subsystemName,
          ),
        )
      }
      selectedSubsystemTemplates={selectedSubsystemTemplates}
      setCustomSubsystemName={setCustomSubsystemName}
      toggleDefaultSubsystemTemplate={(subsystemName) =>
        setSelectedSubsystemTemplates((currentSubsystemTemplates) =>
          currentSubsystemTemplates.includes(subsystemName)
            ? currentSubsystemTemplates.filter(
                (currentSubsystemTemplate) =>
                  currentSubsystemTemplate !== subsystemName,
              )
            : [...currentSubsystemTemplates, subsystemName],
        )
      }
      updateProject={() => undefined}
    />
  );
}

test("allows deselecting a default subsystem template", async () => {
  const user = userEvent.setup();

  render(<ProjectTemplateSubsystemHarness />);

  const navigationTemplateToggle = screen.getByLabelText("导航");

  expect(navigationTemplateToggle).toBeChecked();

  await user.click(navigationTemplateToggle);

  expect(navigationTemplateToggle).not.toBeChecked();
});

test("allows adding a custom subsystem template", async () => {
  const user = userEvent.setup();

  render(<ProjectTemplateSubsystemHarness />);

  await user.type(screen.getByLabelText("自定义子系统"), "定位");
  await user.click(screen.getByRole("button", { name: "添加子系统模板" }));

  expect(screen.getByText("定位")).toBeInTheDocument();
  expect(screen.getByLabelText("自定义子系统")).toHaveValue("");
});
