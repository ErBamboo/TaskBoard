"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { AdminActionFeedback, AdminSectionShell, AdminSubmitButton } from "@/components/admin/admin-primitives";
import { upsertProjectAction } from "@/features/admin/actions";
import { initialAdminActionState } from "@/features/admin/admin-form-schema";
import { buildAdminUrl } from "@/features/admin/admin-url";
import type { ProjectStatus } from "@/types/database";

type ProjectEditor = {
  defaults: {
    description: string;
    name: string;
    projectId: string;
    startDate: string;
    status: ProjectStatus;
    targetDate: string;
  };
  mode: "create" | "edit";
};

type ManagedProject = {
  description: string;
  id: string;
  milestoneCount: number;
  name: string;
  startDate: string | null;
  status: ProjectStatus;
  subsystemCount: number;
  targetDate: string | null;
};

type ProjectManagementProperties = {
  editor: ProjectEditor;
  projects: ManagedProject[];
  scopeProjectId: string | null;
};

const projectStatusOptions = [
  { label: "规划中", value: "planning" },
  { label: "进行中", value: "active" },
  { label: "已归档", value: "archived" },
] as const;

const projectStatusLabelMap = {
  planning: "规划中",
  active: "进行中",
  archived: "已归档",
} as const;

function ProjectListCard({
  project,
  scopeProjectId,
}: {
  project: ManagedProject;
  scopeProjectId: string | null;
}) {
  return (
    <article className="grid gap-4 rounded-[1.3rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.68)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {project.name}
            </h3>
            <span className="rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
              {projectStatusLabelMap[project.status]}
            </span>
          </div>
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            {project.description || "暂无项目描述。"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildAdminUrl({
              scopeProjectId,
              editProjectId: project.id,
            })}
            className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            编辑项目
          </Link>
          <Link
            href={buildAdminUrl({
              scopeProjectId: project.id,
            })}
            className="rounded-full border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#106875] transition-colors duration-200 hover:border-[#106875]"
          >
            设为作用域
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            子系统
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
            {project.subsystemCount}
          </p>
        </div>
        <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            里程碑
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
            {project.milestoneCount}
          </p>
        </div>
        <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            开始日期
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted-strong)]">
            {project.startDate ?? "未设置"}
          </p>
        </div>
        <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            目标日期
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted-strong)]">
            {project.targetDate ?? "未设置"}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ProjectManagement({
  editor,
  projects,
  scopeProjectId,
}: ProjectManagementProperties) {
  const [actionState, formAction] = useActionState(
    upsertProjectAction,
    initialAdminActionState,
  );
  const formReference = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionState.status === "success" && editor.mode === "create") {
      formReference.current?.reset();
    }
  }, [actionState.status, editor.mode]);

  return (
    <AdminSectionShell
      eyebrow="Projects"
      title="项目管理"
      description="项目是整个系统的一级交付对象。这里维护项目本体信息，并为后续子系统与里程碑设定作用域。"
    >
      <form
        ref={formReference}
        action={formAction}
        key={`${editor.mode}-${editor.defaults.projectId || "new"}`}
        className="grid gap-4 rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4"
      >
        <input type="hidden" name="projectId" value={editor.defaults.projectId} />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {editor.mode === "edit" ? "Editing project" : "Create project"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {editor.mode === "edit" ? "编辑项目" : "新建项目"}
            </h3>
          </div>
          {editor.mode === "edit" ? (
            <Link
              href={buildAdminUrl({ scopeProjectId })}
              className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              取消编辑
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              项目名称
            </span>
            <input
              type="text"
              name="name"
              required
              defaultValue={editor.defaults.name}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="例如：Hero Robot 2026"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              项目状态
            </span>
            <select
              name="status"
              defaultValue={editor.defaults.status}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              {projectStatusOptions.map((projectStatusOption) => (
                <option
                  key={projectStatusOption.value}
                  value={projectStatusOption.value}
                >
                  {projectStatusOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            项目描述
          </span>
          <textarea
            name="description"
            rows={3}
            defaultValue={editor.defaults.description}
            className="min-h-28 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="描述项目目标、赛季角色和交付边界。"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              开始日期
            </span>
            <input
              type="date"
              name="startDate"
              defaultValue={editor.defaults.startDate}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              目标日期
            </span>
            <input
              type="date"
              name="targetDate"
              defaultValue={editor.defaults.targetDate}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            />
          </label>
        </div>

        <AdminActionFeedback
          message={actionState.message}
          status={actionState.status}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            归档项目不会删除历史任务，只是从活跃赛季视角中退场。
          </p>
          <AdminSubmitButton
            idleLabel={editor.mode === "edit" ? "更新项目" : "创建项目"}
            pendingLabel="提交中"
          />
        </div>
      </form>

      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectListCard
            key={project.id}
            project={project}
            scopeProjectId={scopeProjectId}
          />
        ))}
      </div>
    </AdminSectionShell>
  );
}
