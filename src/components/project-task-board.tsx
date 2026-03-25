import Link from "next/link";

import { TaskStatusForm } from "@/components/task-status-form";
import type {
  ProjectBoardTask,
  ProjectBoardTaskGroups,
} from "@/features/projects/get-project-board";

type ProjectTaskBoardProperties = {
  groupedTasks: ProjectBoardTaskGroups;
  projectId: string;
};

function ProjectTaskCard({
  projectId,
  task,
}: {
  projectId: string;
  task: ProjectBoardTask;
}) {
  return (
    <article
      className={[
        "grid gap-3 rounded-[1.25rem] border bg-[rgba(255,255,255,0.72)] p-4 shadow-[4px_4px_0_var(--color-shadow)]",
        task.status === "blocked"
          ? "border-[rgba(204,75,27,0.26)]"
          : "border-[var(--color-line)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            {task.subsystemName} / {task.assigneeName}
          </p>
          <h3 className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
            {task.title}
          </h3>
        </div>
        {task.isIntegrationTask ? (
          <span className="rounded-full border border-[rgba(16,104,117,0.18)] bg-[rgba(16,104,117,0.08)] px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#106875]">
            联调
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 text-sm leading-6 text-[var(--color-muted-strong)]">
        <p>优先级：{task.priority}</p>
        <p>里程碑：{task.milestoneName ?? "未关联"}</p>
        <p>截止：{task.dueAt ? new Date(task.dueAt).toLocaleString("zh-CN") : "未设置"}</p>
        {task.status === "blocked" && task.blockedReason ? (
          <p className="rounded-xl border border-[rgba(204,75,27,0.18)] bg-[rgba(204,75,27,0.08)] px-3 py-2 text-[var(--color-accent)]">
            {task.blockedReason}
          </p>
        ) : null}
      </div>

      {task.canEdit || task.canUpdateStatus ? (
        <div className="grid gap-3 border-t border-[var(--color-line)] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {task.canEdit ? (
              <Link
                href={`/projects/${projectId}?editTaskId=${task.id}`}
                className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-accent)] transition-colors duration-200 hover:text-[var(--color-ink)]"
              >
                编辑任务
              </Link>
            ) : (
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                只读查看
              </span>
            )}

            {task.canUpdateStatus ? (
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
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ProjectTaskColumn({
  label,
  projectId,
  status,
  tasks,
}: {
  label: string;
  projectId: string;
  status: keyof ProjectBoardTaskGroups;
  tasks: ProjectBoardTask[];
}) {
  return (
    <section className="grid gap-4 rounded-[1.7rem] border border-[var(--color-line-strong)] bg-[rgba(246,242,232,0.92)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">
            {status}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.04em] text-[var(--color-ink)]">
            {label}
          </h2>
        </div>
        <span className="rounded-full border border-[var(--color-line)] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {tasks.length}
        </span>
      </div>

      <div className="grid gap-4 [content-visibility:auto]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <ProjectTaskCard key={task.id} projectId={projectId} task={task} />
          ))
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-[var(--color-line)] px-4 py-6 text-sm leading-7 text-[var(--color-muted-strong)]">
            当前列暂无任务。
          </div>
        )}
      </div>
    </section>
  );
}

const boardColumns = [
  { key: "todo", label: "待开始" },
  { key: "in_progress", label: "进行中" },
  { key: "blocked", label: "阻塞任务" },
  { key: "done", label: "已完成" },
] as const;

export function ProjectTaskBoard({
  groupedTasks,
  projectId,
}: ProjectTaskBoardProperties) {
  return (
    <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
      {boardColumns.map((boardColumn) => (
        <ProjectTaskColumn
          key={boardColumn.key}
          label={boardColumn.label}
          projectId={projectId}
          status={boardColumn.key}
          tasks={groupedTasks[boardColumn.key]}
        />
      ))}
    </section>
  );
}
