"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { MemberImportStep } from "@/components/setup/member-import-step";
import { ProjectTemplateStep } from "@/components/setup/project-template-step";
import { TeamBasicsStep } from "@/components/setup/team-basics-step";
import {
  initialSetupActionState,
  type SetupMemberInput,
  type SetupProjectInput,
} from "@/features/setup/setup-schema";
import { initializeWorkspaceAction } from "@/features/setup/actions";

type SetupWizardProperties = {
  defaults: {
    seasonName: string;
    teamName: string;
  };
};

const setupStepDefinitions = [
  {
    description: "输入战队名称和当前赛季。",
    title: "基础信息",
  },
  {
    description: "创建初始项目，并预览系统会自动生成的默认子系统模板。",
    title: "项目模板",
  },
  {
    description: "录入首批成员，系统会自动生成临时密码。",
    title: "成员导入",
  },
  {
    description: "确认初始化内容并提交。",
    title: "完成初始化",
  },
] as const;

function createEmptyProject(): SetupProjectInput {
  return {
    name: "",
    description: "",
  };
}

function createEmptyMember(): SetupMemberInput {
  return {
    displayName: "",
    email: "",
  };
}

function SetupSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "初始化中" : "执行首次初始化"}
    </button>
  );
}

function getStepValidationMessage(
  currentStep: number,
  members: SetupMemberInput[],
  projects: SetupProjectInput[],
  seasonName: string,
  teamName: string,
) {
  if (currentStep === 0) {
    if (teamName.trim().length === 0 || seasonName.trim().length === 0) {
      return "请先填写战队名称和赛季名称。";
    }
  }

  if (currentStep === 1) {
    const hasIncompleteProject = projects.some(
      (project) => project.name.trim().length === 0,
    );

    if (hasIncompleteProject) {
      return "请补齐每个初始项目的名称。";
    }
  }

  if (currentStep === 2) {
    const hasIncompleteMember = members.some(
      (member) =>
        member.displayName.trim().length === 0 || member.email.trim().length === 0,
    );

    if (hasIncompleteMember) {
      return "请补齐每位成员的姓名和邮箱。";
    }
  }

  return null;
}

export function SetupWizard({ defaults }: SetupWizardProperties) {
  const [setupActionState, setupFormAction] = useActionState(
    initializeWorkspaceAction,
    initialSetupActionState,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [localStepMessage, setLocalStepMessage] = useState("");
  const [teamName, setTeamName] = useState(defaults.teamName);
  const [seasonName, setSeasonName] = useState(defaults.seasonName);
  const [projects, setProjects] = useState<SetupProjectInput[]>([
    createEmptyProject(),
  ]);
  const [members, setMembers] = useState<SetupMemberInput[]>([
    createEmptyMember(),
  ]);
  const effectiveCurrentStep =
    setupActionState.status === "success"
      ? setupStepDefinitions.length - 1
      : currentStep;

  function moveToNextStep() {
    const validationMessage = getStepValidationMessage(
      currentStep,
      members,
      projects,
      seasonName,
      teamName,
    );

    if (validationMessage) {
      setLocalStepMessage(validationMessage);
      return;
    }

    setLocalStepMessage("");
    setCurrentStep((currentValue) =>
      Math.min(currentValue + 1, setupStepDefinitions.length - 1),
    );
  }

  function moveToPreviousStep() {
    setLocalStepMessage("");
    setCurrentStep((currentValue) => Math.max(currentValue - 1, 0));
  }

  function updateProject(
    index: number,
    field: keyof SetupProjectInput,
    value: string,
  ) {
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
  }

  function updateMember(
    index: number,
    field: keyof SetupMemberInput,
    value: string,
  ) {
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
  }

  return (
    <section className="grid gap-6 rounded-[2rem] border border-[var(--color-line-strong)] bg-[linear-gradient(180deg,_rgba(249,246,239,0.98),_rgba(242,237,226,0.96))] p-6 shadow-[8px_8px_0_var(--color-shadow)]">
      <div className="grid gap-3 lg:grid-cols-4">
        {setupStepDefinitions.map((setupStepDefinition, index) => {
          const isActive = index === effectiveCurrentStep;
          const isCompleted =
            setupActionState.status === "success" || index < effectiveCurrentStep;

          return (
            <article
              key={setupStepDefinition.title}
              className={[
                "rounded-[1.25rem] border p-4 transition-colors duration-200",
                isActive
                  ? "border-[var(--color-line-strong)] bg-[var(--color-panel)]"
                  : isCompleted
                    ? "border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)]"
                    : "border-[var(--color-line)] bg-[rgba(255,255,255,0.58)]",
              ].join(" ")}
            >
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Step {index + 1}
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-[0.04em] text-[var(--color-ink)]">
                {setupStepDefinition.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted-strong)]">
                {setupStepDefinition.description}
              </p>
            </article>
          );
        })}
      </div>

      {setupActionState.status === "success" ? (
        <section className="grid gap-5 rounded-[1.4rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] p-5">
          <div className="space-y-2">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[#106875]">
              Initialization complete
            </p>
            <h2 className="text-2xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              首次初始化已完成
            </h2>
            <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
              {setupActionState.message}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {setupActionState.temporaryCredentials.map((temporaryCredential) => (
              <article
                key={temporaryCredential.email}
                className="grid gap-2 rounded-[1.15rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.78)] p-4"
              >
                <p className="font-semibold text-[var(--color-ink)]">
                  {temporaryCredential.displayName}
                </p>
                <p className="text-sm text-[var(--color-muted-strong)]">
                  {temporaryCredential.email}
                </p>
                <p className="font-mono text-sm text-[#106875]">
                  {temporaryCredential.temporaryPassword}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-panel)]"
            >
              进入管理台
            </Link>
            <Link
              href="/my-tasks"
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--color-muted-strong)]"
            >
              进入我的任务
            </Link>
          </div>
        </section>
      ) : null}

      <form action={setupFormAction} className="grid gap-6">
        <input type="hidden" name="teamName" value={teamName} />
        <input type="hidden" name="seasonName" value={seasonName} />
        <input type="hidden" name="projects" value={JSON.stringify(projects)} />
        <input type="hidden" name="members" value={JSON.stringify(members)} />

        <section className="grid gap-5 rounded-[1.5rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
          <div className="space-y-2">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-accent)]">
              当前步骤
            </p>
            <h2 className="text-2xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {setupStepDefinitions[effectiveCurrentStep].title}
            </h2>
          </div>

          {effectiveCurrentStep === 0 ? (
            <TeamBasicsStep
              seasonName={seasonName}
              setSeasonName={setSeasonName}
              setTeamName={setTeamName}
              teamName={teamName}
            />
          ) : null}

          {effectiveCurrentStep === 1 ? (
            <ProjectTemplateStep
              addProject={() =>
                setProjects((currentProjects) => [
                  ...currentProjects,
                  createEmptyProject(),
                ])
              }
              projects={projects}
              removeProject={(index) =>
                setProjects((currentProjects) =>
                  currentProjects.filter((_, projectIndex) => projectIndex !== index),
                )
              }
              updateProject={updateProject}
            />
          ) : null}

          {effectiveCurrentStep === 2 ? (
            <MemberImportStep
              addMember={() =>
                setMembers((currentMembers) => [
                  ...currentMembers,
                  createEmptyMember(),
                ])
              }
              members={members}
              removeMember={(index) =>
                setMembers((currentMembers) =>
                  currentMembers.filter((_, memberIndex) => memberIndex !== index),
                )
              }
              updateMember={updateMember}
            />
          ) : null}

          {effectiveCurrentStep === 3 ? (
            <div className="grid gap-5">
              <article className="grid gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  战队信息
                </p>
                <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
                  {teamName} / {seasonName}
                </p>
              </article>

              <article className="grid gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  初始项目
                </p>
                <div className="grid gap-2">
                  {projects.map((project, index) => (
                    <p
                      key={`${project.name}-${index}`}
                      className="text-sm leading-7 text-[var(--color-muted-strong)]"
                    >
                      {project.name || "未命名项目"}
                    </p>
                  ))}
                </div>
              </article>

              <article className="grid gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  首批成员
                </p>
                <div className="grid gap-2">
                  {members.map((member, index) => (
                    <p
                      key={`${member.email}-${index}`}
                      className="text-sm leading-7 text-[var(--color-muted-strong)]"
                    >
                      {member.displayName || "未命名成员"} / {member.email || "未填写邮箱"}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          ) : null}
        </section>

        {setupActionState.status !== "success" && localStepMessage ? (
          <p className="rounded-[1rem] border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] px-4 py-3 text-sm leading-7 text-[var(--color-accent)]">
            {localStepMessage}
          </p>
        ) : null}

        {setupActionState.status === "error" ? (
          <p className="rounded-[1rem] border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] px-4 py-3 text-sm leading-7 text-[var(--color-accent)]">
            {setupActionState.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={moveToPreviousStep}
              disabled={effectiveCurrentStep === 0 || setupActionState.status === "success"}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一步
            </button>

            {effectiveCurrentStep < setupStepDefinitions.length - 1 ? (
              <button
                type="button"
                onClick={moveToNextStep}
                className="rounded-[1rem] border border-[var(--color-line-strong)] bg-[var(--color-ink)] px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-panel)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                下一步
              </button>
            ) : (
              <SetupSubmitButton />
            )}
          </div>

          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            初始化只执行一次。完成后普通成员安装客户端并登录即可进入系统。
          </p>
        </div>
      </form>
    </section>
  );
}
