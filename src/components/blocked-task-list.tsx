import type { DashboardTask } from "@/features/dashboard/get-my-task-dashboard";

type BlockedTaskListProperties = {
  tasks: DashboardTask[];
};

export function BlockedTaskList({ tasks }: BlockedTaskListProperties) {
  return (
    <section className="rounded-[1.6rem] border border-[rgba(204,75,27,0.26)] bg-[rgba(204,75,27,0.06)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Blocked
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.05em] text-[var(--color-ink)]">
            阻塞任务
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {tasks.length} issues
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-[1.25rem] border border-[rgba(204,75,27,0.18)] bg-[rgba(255,255,255,0.64)] px-4 py-3"
            >
              <p className="text-sm font-semibold text-[var(--color-ink)]">{task.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted-strong)]">
                {task.blockedReason || "未填写阻塞原因"}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            当前没有阻塞项。
          </p>
        )}
      </div>
    </section>
  );
}
