"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { AdminActionFeedback, AdminSectionShell, AdminSubmitButton } from "@/components/admin/admin-primitives";
import { initialAdminActionState, upsertSubsystemAction } from "@/features/admin/actions";
import { buildAdminUrl } from "@/features/admin/admin-url";

type SubsystemEditor = {
  defaults: {
    description: string;
    name: string;
    projectId: string;
    sortOrder: number;
    subsystemId: string;
  };
  mode: "create" | "edit";
};

type ProjectOption = {
  id: string;
  name: string;
};

type ManagedSubsystem = {
  description: string;
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  sortOrder: number;
};

type SubsystemManagementProperties = {
  editor: SubsystemEditor;
  projects: ProjectOption[];
  scopeProjectId: string | null;
  scopeProjectName: string | null;
  subsystems: ManagedSubsystem[];
};

function SubsystemCard({
  scopeProjectId,
  subsystem,
}: {
  scopeProjectId: string | null;
  subsystem: ManagedSubsystem;
}) {
  return (
    <article className="grid gap-3 rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.68)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {subsystem.projectName}
          </p>
          <h3 className="mt-2 text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
            {subsystem.name}
          </h3>
        </div>

        <Link
          href={buildAdminUrl({
            scopeProjectId: scopeProjectId ?? subsystem.projectId,
            editSubsystemId: subsystem.id,
          })}
          className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          编辑子系统
        </Link>
      </div>

      <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
        {subsystem.description || "暂无子系统描述。"}
      </p>

      <div className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          排序
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
          {subsystem.sortOrder}
        </p>
      </div>
    </article>
  );
}

export function SubsystemManagement({
  editor,
  projects,
  scopeProjectId,
  scopeProjectName,
  subsystems,
}: SubsystemManagementProperties) {
  const [actionState, formAction] = useActionState(
    upsertSubsystemAction,
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
      eyebrow="Subsystems"
      title="子系统管理"
      description="子系统是项目内部的技术对象层。先锁定项目作用域，再维护底盘、云台、视觉、通信等执行域。"
    >
      <div className="rounded-[1.2rem] border border-[rgba(16,104,117,0.22)] bg-[rgba(16,104,117,0.08)] px-4 py-3 text-sm leading-7 text-[#106875]">
        当前作用域：
        {scopeProjectName ?? "暂无项目，请先创建项目。"}
      </div>

      <form
        ref={formReference}
        action={formAction}
        key={`${editor.mode}-${editor.defaults.subsystemId || "new"}`}
        className="grid gap-4 rounded-[1.35rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4"
      >
        <input
          type="hidden"
          name="subsystemId"
          value={editor.defaults.subsystemId}
        />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {editor.mode === "edit" ? "Editing subsystem" : "Create subsystem"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[0.04em] text-[var(--color-ink)]">
              {editor.mode === "edit" ? "编辑子系统" : "新建子系统"}
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

        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_0.6fr]">
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
              子系统名称
            </span>
            <input
              type="text"
              name="name"
              required
              defaultValue={editor.defaults.name}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
              placeholder="例如：Vision"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              排序
            </span>
            <input
              type="number"
              name="sortOrder"
              min={0}
              required
              defaultValue={editor.defaults.sortOrder}
              className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            子系统描述
          </span>
          <textarea
            name="description"
            rows={3}
            defaultValue={editor.defaults.description}
            className="min-h-28 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
            placeholder="描述该子系统的边界、接口或关键职责。"
          />
        </label>

        <AdminActionFeedback
          message={actionState.message}
          status={actionState.status}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            作用域会影响当前列表筛选，但编辑时仍可切换所属项目。
          </p>
          <AdminSubmitButton
            idleLabel={editor.mode === "edit" ? "更新子系统" : "创建子系统"}
            pendingLabel="提交中"
          />
        </div>
      </form>

      <div className="grid gap-4">
        {subsystems.length > 0 ? (
          subsystems.map((subsystem) => (
            <SubsystemCard
              key={subsystem.id}
              scopeProjectId={scopeProjectId}
              subsystem={subsystem}
            />
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--color-line)] px-4 py-6 text-sm leading-7 text-[var(--color-muted-strong)]">
            当前作用域下还没有子系统。
          </div>
        )}
      </div>
    </AdminSectionShell>
  );
}
