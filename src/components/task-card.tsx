import Link from "next/link";

import { TaskStatusForm } from "@/components/task-status-form";
import type { DashboardTask } from "@/features/dashboard/get-my-task-dashboard";

type TaskCardProperties = {
  task: DashboardTask;
};

const priorityLabelMap = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
} as const;

export function TaskCard({ task }: TaskCardProperties) {
  return (
    <article
      className={[
        "grid gap-4 rounded-[1.35rem] border bg-[rgba(255,255,255,0.72)] p-4 shadow-[4px_4px_0_var(--color-shadow)]",
        task.status === "blocked"
          ? "border-[rgba(204,75,27,0.35)]"
          : "border-[var(--color-line)]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            {task.projectName} / {task.subsystemName}
          </p>
          <h3 className="text-base font-semibold tracking-[0.04em] text-[var(--color-ink)]">
            {task.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
            {priorityLabelMap[task.priority]}
          </span>
          {task.isIntegrationTask ? (
            <span className="rounded-full border border-[rgba(16,104,117,0.25)] bg-[rgba(16,104,117,0.08)] px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#106875]">
              联调
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 text-sm leading-7 text-[var(--color-muted-strong)]">
        {task.milestoneName ? <p>里程碑：{task.milestoneName}</p> : null}
        {task.dueAt ? (
          <p>截止：{new Date(task.dueAt).toLocaleString("zh-CN")}</p>
        ) : (
          <p>截止：未设置</p>
        )}
        {task.status === "blocked" && task.blockedReason ? (
          <p className="rounded-2xl border border-[rgba(204,75,27,0.18)] bg-[rgba(204,75,27,0.08)] px-3 py-2 text-[var(--color-accent)]">
            阻塞原因：{task.blockedReason}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-[var(--color-line)] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {task.projectId ? (
            <Link
              href={`/projects/${task.projectId}?editTaskId=${task.id}`}
              className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-accent)] transition-colors duration-200 hover:text-[var(--color-ink)]"
            >
              编辑任务
            </Link>
          ) : (
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              当前任务
            </span>
          )}

          <details className="group">
            <summary className="cursor-pointer list-none font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)]">
              状态流转
            </summary>
            <div className="mt-3">
              <TaskStatusForm
                blockedReason={task.blockedReason}
                currentStatus={task.status}
                taskId={task.id}
              />
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}
