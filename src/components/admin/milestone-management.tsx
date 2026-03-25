"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { AdminActionFeedback, AdminSectionShell, AdminSubmitButton } from "@/components/admin/admin-primitives";
import { upsertMilestoneAction } from "@/features/admin/actions";
import { initialAdminActionState } from "@/features/admin/admin-form-schema";
import { buildAdminUrl } from "@/features/admin/admin-url";
import type { MilestoneStatus } from "@/types/database";

type MilestoneEditor = {
  defaults: {
    description: string;
    dueDate: string;
    milestoneId: string;
    name: string;
    projectId: string;
    status: MilestoneStatus;
  };
  mode: "create" | "edit";
};

type ProjectOption = {
  id: string;
  name: string;
};

type ManagedMilestone = {
  description: string;
  dueDate: string | null;
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: MilestoneStatus;
};

type MilestoneManagementProperties = {
  editor: MilestoneEditor;
  milestones: ManagedMilestone[];
  projects: ProjectOption[];
  scopeProjectId: string | null;
  scopeProjectName: string | null;
};

const milestoneStatusOptions = [
  { label: "未开始", value: "pending" },
  { label: "进行中", value: "active" },
  { label: "已完成", value: "completed" },
] as const;

const milestoneStatusLabelMap = {
  pending: "未开始",
  active: "进行中",
  completed: "已完成",
} as const;

function MilestoneCard({
  milestone,
  scopeProjectId,
}: {
  milestone: ManagedMilestone;
  scopeProjectId: string | null;
}) {
  return (
    <article className="grid gap-3 rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.68)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {milestone.projectName}
          </p>
          <h3 className="mt-2 text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
            {milestone.name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
            {milestoneStatusLabelMap[milestone.status]}
          </span>
          <Link
            href={buildAdminUrl({
              scopeProjectId: scopeProjectId ?? milestone.projectId,
              editMilestoneId: milestone.id,
            })}
            className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            编辑里程碑
          </Link>
        </div>
      </div>

      <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
        {milestone.description || "暂无里程碑描述。"}
      </p>

      <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          目标日期
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted-strong)]">
          {milestone.dueDate ?? "未设置"}
        </p>
      </div>
    </article>
  );
}

export function MilestoneManagement({
  editor,
  milestones,
  projects,
  scopeProjectId,
  scopeProjectName,
}: MilestoneManagementProperties) {
  const [actionState, formAction] = useActionState(
    upsertMilestoneAction,
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
      eyebrow="Milestones"
      title="里程碑管理"
      description="里程碑只表达阶段性交付目标，不承载具体执行细项。管理员在这里定义项目节奏与阶段检查点。"
    >
      <div className="rounded-[1.2rem] border border-[rgba(204,75,27,0.24)] bg-[rgba(204,75,27,0.08)] px-4 py-3 text-sm leading-7 text-[var(--color-accent)]">
        当前作用域：
        {scopeProjectName ?? "暂无项目，请先创建项目。"}
      </div>

      <form
        ref={formReference}
        action={formAction}
        key={`${editor.mode}-${editor.defaults.milestoneId || "new"}`}
        className="grid gap-4 rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4"
      >
        <input
          type="hidden"
          name="milestoneId"
          value={editor.defaults.milestoneId}
        />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {editor.mode === "edit" ? "Editing milestone" : "Create milestone"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {editor.mode === "edit" ? "编辑里程碑" : "新建里程碑"}
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

        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_0.8fr]">
          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              所属项目
            </span>
            <select
              name="projectId"
              required
              defaultValue={editor.defaults.projectId}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              <option value="">选择项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              里程碑名称
            </span>
            <input
              type="text"
              name="name"
              required
              defaultValue={editor.defaults.name}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="例如：First Integration"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              状态
            </span>
            <select
              name="status"
              defaultValue={editor.defaults.status}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            >
              {milestoneStatusOptions.map((milestoneStatusOption) => (
                <option
                  key={milestoneStatusOption.value}
                  value={milestoneStatusOption.value}
                >
                  {milestoneStatusOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            里程碑说明
          </span>
          <textarea
            name="description"
            rows={3}
            defaultValue={editor.defaults.description}
            className="min-h-28 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="写清这一步应该达到的交付状态。"
          />
        </label>

        <label className="grid gap-2 md:max-w-xs">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            目标日期
          </span>
          <input
            type="date"
            name="dueDate"
            defaultValue={editor.defaults.dueDate}
            className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
          />
        </label>

        <AdminActionFeedback
          message={actionState.message}
          status={actionState.status}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            里程碑更适合描述阶段性成果，不适合塞入大量执行步骤。
          </p>
          <AdminSubmitButton
            idleLabel={editor.mode === "edit" ? "更新里程碑" : "创建里程碑"}
            pendingLabel="提交中"
          />
        </div>
      </form>

      <div className="grid gap-4">
        {milestones.length > 0 ? (
          milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              scopeProjectId={scopeProjectId}
            />
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--color-line)] px-4 py-6 text-sm leading-7 text-[var(--color-muted-strong)]">
            当前作用域下还没有里程碑。
          </div>
        )}
      </div>
    </AdminSectionShell>
  );
}
