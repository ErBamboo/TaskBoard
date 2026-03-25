import type {
  DashboardTask,
  DashboardTaskGroups,
} from "@/features/dashboard/get-my-task-dashboard";
import { TaskCard } from "@/components/task-card";

type TaskStatusColumnProperties = {
  label: string;
  status: keyof DashboardTaskGroups;
  tasks: DashboardTask[];
};

export function TaskStatusColumn({
  label,
  status,
  tasks,
}: TaskStatusColumnProperties) {
  return (
    <section className="grid gap-4 rounded-[1.7rem] border border-[var(--color-line-strong)] bg-[rgba(246,242,232,0.92)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            {status}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.05em] text-[var(--color-ink)]">
            {label}
          </h2>
        </div>
        <div className="rounded-full border border-[var(--color-line)] px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {tasks.length}
        </div>
      </div>

      <div className="grid gap-4 [content-visibility:auto]">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--color-line)] px-4 py-6 text-sm leading-7 text-[var(--color-muted-strong)]">
            当前列暂无任务。
          </div>
        )}
      </div>
    </section>
  );
}
