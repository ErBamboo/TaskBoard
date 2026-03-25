import type { DashboardTask } from "@/features/dashboard/get-my-task-dashboard";

type UpcomingDeadlinesProperties = {
  tasks: DashboardTask[];
};

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProperties) {
  return (
    <section className="rounded-[1.6rem] border border-[var(--color-line-strong)] bg-[var(--color-panel)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            Deadlines
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.05em] text-[var(--color-ink)]">
            临近截止
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {tasks.length} items
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-[1.25rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.64)] px-4 py-3"
            >
              <p className="text-sm font-semibold text-[var(--color-ink)]">{task.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted-strong)]">
                {task.projectName} / {task.subsystemName}
              </p>
              <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {task.dueAt
                  ? new Date(task.dueAt).toLocaleString("zh-CN")
                  : "未设置截止"}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
            当前没有临近截止任务。
          </p>
        )}
      </div>
    </section>
  );
}
