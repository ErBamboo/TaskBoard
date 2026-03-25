"use client";

import { useState } from "react";

import type { SetupProjectDraft } from "@/features/setup/setup-drafts";
import { defaultSubsystemTemplates, type SetupProjectInput } from "@/features/setup/setup-schema";

const defaultSubsystemTemplateSet = new Set<string>(defaultSubsystemTemplates);

type ProjectTemplateStepProperties = {
  addCustomSubsystemTemplate: () => void;
  addProject: () => void;
  customSubsystemName: string;
  projects: SetupProjectDraft[];
  removeProject: (index: number) => void;
  removeSubsystemTemplate: (subsystemName: string) => void;
  selectedSubsystemTemplates: string[];
  setCustomSubsystemName: (value: string) => void;
  toggleDefaultSubsystemTemplate: (subsystemName: string) => void;
  updateProject: (
    index: number,
    field: keyof SetupProjectInput,
    value: string,
  ) => void;
};

export function ProjectTemplateStep({
  addCustomSubsystemTemplate,
  addProject,
  customSubsystemName,
  projects,
  removeProject,
  removeSubsystemTemplate,
  selectedSubsystemTemplates,
  setCustomSubsystemName,
  toggleDefaultSubsystemTemplate,
  updateProject,
}: ProjectTemplateStepProperties) {
  const [subsystemTemplateMessage, setSubsystemTemplateMessage] = useState("");
  const customSubsystemTemplates = selectedSubsystemTemplates.filter(
    (subsystemTemplate) => !defaultSubsystemTemplateSet.has(subsystemTemplate),
  );

  function handleAddCustomSubsystemTemplate() {
    if (customSubsystemName.trim().length === 0) {
      setSubsystemTemplateMessage("请输入自定义子系统名称。");
      return;
    }

    if (selectedSubsystemTemplates.includes(customSubsystemName.trim())) {
      setSubsystemTemplateMessage("子系统模板不能重复。");
      return;
    }

    setSubsystemTemplateMessage("");
    addCustomSubsystemTemplate();
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4">
        {projects.map((project, index) => (
          <article
            key={project.clientId}
            className="grid gap-4 rounded-[1.2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                项目 {index + 1}
              </p>
              {projects.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  删除
                </button>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`setup-project-name-${index}`}
                className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
              >
                项目名称
              </label>
              <input
                id={`setup-project-name-${index}`}
                type="text"
                value={project.name}
                onChange={(event) =>
                  updateProject(index, "name", event.currentTarget.value)
                }
                className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                placeholder="例如：英雄机器人"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`setup-project-description-${index}`}
                className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
              >
                项目说明
              </label>
              <textarea
                id={`setup-project-description-${index}`}
                rows={3}
                value={project.description}
                onChange={(event) =>
                  updateProject(index, "description", event.currentTarget.value)
                }
                className="min-h-24 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                placeholder="可选：描述这个项目的目标和比赛定位。"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {projects.length < 3 ? (
          <button
            type="button"
            onClick={addProject}
            className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            添加项目
          </button>
        ) : null}
        <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
          初始化阶段最多建议创建 3 个项目，后续仍可在管理台继续追加。
        </p>
      </div>

      <section className="grid gap-3 rounded-[1.3rem] border border-[rgba(16,104,117,0.2)] bg-[rgba(16,104,117,0.08)] p-4">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[#106875]">
          默认子系统模板
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {defaultSubsystemTemplates.map((subsystemTemplate) => (
            <label
              key={subsystemTemplate}
              className="flex items-center gap-3 rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm text-[#106875]"
            >
              <input
                type="checkbox"
                checked={selectedSubsystemTemplates.includes(subsystemTemplate)}
                onChange={() => {
                  setSubsystemTemplateMessage("");
                  toggleDefaultSubsystemTemplate(subsystemTemplate);
                }}
                className="h-4 w-4 rounded border-[rgba(16,104,117,0.4)] text-[#106875] focus:ring-[#106875]"
              />
              <span>{subsystemTemplate}</span>
            </label>
          ))}
        </div>

        <div className="grid gap-3 rounded-[1rem] border border-[rgba(16,104,117,0.16)] bg-[rgba(255,255,255,0.72)] p-4">
          <label
            htmlFor="setup-custom-subsystem-template"
            className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[#106875]"
          >
            自定义子系统
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="setup-custom-subsystem-template"
              type="text"
              value={customSubsystemName}
              onChange={(event) => {
                setSubsystemTemplateMessage("");
                setCustomSubsystemName(event.currentTarget.value);
              }}
              className="min-w-56 flex-1 rounded-[1rem] border border-[rgba(16,104,117,0.18)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="例如：裁判系统"
            />
            <button
              type="button"
              onClick={handleAddCustomSubsystemTemplate}
              className="rounded-[1rem] border border-[rgba(16,104,117,0.22)] bg-[var(--color-panel)] px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#106875] transition-transform duration-200 hover:-translate-y-0.5"
            >
              添加子系统模板
            </button>
          </div>

          {customSubsystemTemplates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customSubsystemTemplates.map((subsystemTemplate) => (
                <button
                  key={subsystemTemplate}
                  type="button"
                  onClick={() => {
                    setSubsystemTemplateMessage("");
                    removeSubsystemTemplate(subsystemTemplate);
                  }}
                  className="rounded-full border border-[rgba(16,104,117,0.22)] px-3 py-1 text-sm text-[#106875]"
                >
                  {subsystemTemplate} ×
                </button>
              ))}
            </div>
          ) : null}

          {subsystemTemplateMessage ? (
            <p className="text-sm leading-7 text-[var(--color-accent)]">
              {subsystemTemplateMessage}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[#106875]">
            最终启用的子系统
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSubsystemTemplates.map((subsystemTemplate) => (
              <span
                key={subsystemTemplate}
                className="rounded-full border border-[rgba(16,104,117,0.22)] bg-[rgba(255,255,255,0.75)] px-3 py-1 text-sm text-[#106875]"
              >
                {subsystemTemplate}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
