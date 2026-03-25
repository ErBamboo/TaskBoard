import { redirect } from "next/navigation";

import { BlockedTaskList } from "@/components/blocked-task-list";
import { MissionEmptyState } from "@/components/mission-empty-state";
import { TaskStatusColumn } from "@/components/task-status-column";
import { UpcomingDeadlines } from "@/components/upcoming-deadlines";
import { getMyTaskDashboard } from "@/features/dashboard/get-my-task-dashboard";

const dashboardColumnDefinitions = [
  {
    key: "todo",
    label: "待开始",
  },
  {
    key: "in_progress",
    label: "进行中",
  },
  {
    key: "blocked",
    label: "阻塞",
  },
  {
    key: "done",
    label: "已完成",
  },
] as const;

export default async function MyTasksPage() {
  const dashboard = await getMyTaskDashboard();

  if (!dashboard) {
    redirect("/login");
  }

  const totalTaskCount = Object.values(dashboard.groupedTasks).reduce(
    (count, tasks) => count + tasks.length,
    0,
  );

  return (
    <main className="grid gap-8">
      <section className="grid gap-5 rounded-[2rem] border border-[var(--color-line-strong)] bg-[rgba(249,246,239,0.92)] p-6 shadow-[8px_8px_0_var(--color-shadow)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Personal execution board
          </p>
          <h1 className="font-['Arial_Narrow','Helvetica_Neue_Condensed','Bahnschrift','sans-serif'] text-4xl uppercase tracking-[0.1em] text-[var(--color-ink)] lg:text-5xl">
            {dashboard.userDisplayName} 的任务面板
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--color-muted-strong)]">
            这里优先展示你需要推进的任务、即将到期事项和当前阻塞项。联调任务会在卡片上单独标记，避免在常规任务里被淹没。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
              Active Milestones
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboard.milestoneNames.length > 0 ? (
                dashboard.milestoneNames.map((milestoneName) => (
                  <span
                    key={milestoneName}
                    className="rounded-full border border-[var(--color-line)] px-3 py-1 text-sm text-[var(--color-muted-strong)]"
                  >
                    {milestoneName}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--color-muted-strong)]">暂无关联里程碑</span>
              )}
            </div>
          </article>

          <article className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
              Focus
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--color-muted-strong)]">
              <p>待开始：{dashboard.groupedTasks.todo.length}</p>
              <p>进行中：{dashboard.groupedTasks.in_progress.length}</p>
              <p>阻塞项：{dashboard.blockedTasks.length}</p>
            </div>
          </article>
        </div>
      </section>

      {totalTaskCount === 0 ? (
        <MissionEmptyState
          eyebrow="Stand by"
          title="当前暂无指派任务"
          description="你当前处于待命状态。可以先查看项目战况，或等待管理员和负责人继续拆分执行任务。"
          action={{
            href: "/projects",
            label: "查看项目战况",
          }}
        />
      ) : (
        <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
            {dashboardColumnDefinitions.map((dashboardColumnDefinition) => (
              <TaskStatusColumn
                key={dashboardColumnDefinition.key}
                label={dashboardColumnDefinition.label}
                status={dashboardColumnDefinition.key}
                tasks={dashboard.groupedTasks[dashboardColumnDefinition.key]}
              />
            ))}
          </div>

          <aside className="grid gap-5">
            <UpcomingDeadlines tasks={dashboard.upcomingTasks} />
            <BlockedTaskList tasks={dashboard.blockedTasks} />
          </aside>
        </section>
      )}
    </main>
  );
}
